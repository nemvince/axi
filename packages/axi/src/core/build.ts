/**
 * Build system for Axi
 * Pre-generates all production artifacts for instant startup
 */

import { mkdir } from "node:fs/promises";
import { join } from "path";
import pkg from "../../package.json";
import type { ResolvedAxiConfig } from "./config";
import { generateApiClient, generateRoutesFile } from "./generator";
import {
    scanApiRoutes,
    scanLayouts,
    scanPageRoutes,
    scanWsRoutes,
} from "./scanner";
import {
    createStyleFieldPlugin,
    fileExists,
    findAllCssFiles,
    generateHash,
    getErrorMessage,
    loadBunPlugins,
    transpileForBrowser,
} from "./utils";

/**
 * Build metadata stored in .axi/.built
 */
export interface BuildMetadata {
  timestamp: number;
  version: string;
  routes: {
    pages: number;
    apis: number;
    ws: number;
    layouts: number;
  };
  bundleSize: number;
  clientHash: string;
  stylesHash: string;
}

/**
 * Build all production artifacts
 */
export async function buildForProduction(
  config: ResolvedAxiConfig
): Promise<void> {
  const startTime = Date.now();

  console.log("");
  console.log("   📦 Axi Build");
  console.log("");
  console.log(" ○ Scanning routes...");

  // Scan all routes and layouts
  const [pageRoutes, apiRoutes, wsRoutes, layouts] = await Promise.all([
    scanPageRoutes(config.appDir),
    scanApiRoutes(config.appDir),
    scanWsRoutes(config.wsDir),
    scanLayouts(config.appDir),
  ]);

  const totalRoutes = pageRoutes.length + apiRoutes.length + wsRoutes.length;

  console.log(
    ` ✓ Found ${totalRoutes} routes (${pageRoutes.length} pages, ${apiRoutes.length} APIs, ${wsRoutes.length} ws)`
  );

  // Create .axi directory
  const axiDir = join(process.cwd(), ".axi");
  await mkdir(axiDir, { recursive: true });

  // Clean up old hashed files before build
  const oldClientFiles = await Array.fromAsync(
    new Bun.Glob("client.*.js").scan(axiDir)
  );
  const oldStylesFiles = await Array.fromAsync(
    new Bun.Glob("styles.*.css").scan(axiDir)
  );
  for (const file of [...oldClientFiles, ...oldStylesFiles]) {
    await Bun.file(join(axiDir, file)).delete().catch(() => {});
  }

  // Generate route files
  console.log(" ○ Generating route files...");
  await generateRoutesFile(config.appDir);
  await generateApiClient(config.appDir, config);
  console.log(" ✓ Generated routes.ts and api-client.ts");

  // Build client bundle
  console.log(" ○ Building client bundle...");
  const entryPath = join(axiDir, "entry.ts");

  if (!(await fileExists(entryPath))) {
    console.error(
      " ✗ Error: entry.ts not found. Route generation may have failed."
    );
    process.exit(1);
  }

  const buildResult = await transpileForBrowser([entryPath], {
    minify: true,
    external: [],
    production: true,
  });

  if (!buildResult.success || !buildResult.output) {
    console.error(" ✗ Failed to build client bundle");
    if (buildResult.logs && buildResult.logs.length > 0) {
      buildResult.logs.forEach((log) => console.error(log));
    }
    process.exit(1);
  }

  // Generate content hash and write hashed client bundle
  const clientHash = generateHash(buildResult.output);
  const clientJsPath = join(axiDir, `client.${clientHash}.js`);
  await Bun.write(clientJsPath, buildResult.output);

  const bundleSize = new TextEncoder().encode(buildResult.output).length;
  const bundleSizeKB = (bundleSize / 1024).toFixed(2);
  console.log(` ✓ Built client.${clientHash}.js (${bundleSizeKB} KB)`);

  // Build and hash CSS
  console.log(" ○ Building styles...");

  // Gather all layout and page file paths to scan
  const filesToScan: string[] = [];

  // Add all layout files
  for (const layoutPath of layouts.values()) {
    filesToScan.push(join(config.appDir, layoutPath));
  }

  // Add all page files
  for (const route of pageRoutes) {
    filesToScan.push(join(config.appDir, route.filepath));
  }

  // Find all CSS files imported across layouts, pages, and their components
  const cssFiles = await findAllCssFiles(filesToScan, config.appDir);
  let stylesHash = "";

  if (cssFiles.length > 0) {
    const plugins = await loadBunPlugins();
    const cssResult = await Bun.build({
      entrypoints: cssFiles,
      minify: true,
      // Resolves bare CSS @imports like `@import "pkg"` via the package.json
      // `style` field, which Bun doesn't handle (oven-sh/bun#19600)
      plugins: [createStyleFieldPlugin(), ...plugins],
    });

    if (cssResult.success && cssResult.outputs.length > 0) {
      // Combine all CSS outputs
      const combinedCss = (
        await Promise.all(cssResult.outputs.map((output) => output.text()))
      ).join("\n");

      stylesHash = generateHash(combinedCss);
      await Bun.write(join(axiDir, `styles.${stylesHash}.css`), combinedCss);
      const cssSizeKB = (combinedCss.length / 1024).toFixed(2);
      console.log(
        ` ✓ Built styles.${stylesHash}.css (${cssSizeKB} KB, ${cssFiles.length} files)`
      );
    } else {
      console.warn(" ⚠ CSS build failed, styles will be processed at runtime");
    }
  } else {
    console.log(" ○ No CSS files found, skipping styles");
  }

  // Write build metadata
  const metadata: BuildMetadata = {
    timestamp: Date.now(),
    version: pkg.version,
    routes: {
      pages: pageRoutes.length,
      apis: apiRoutes.length,
      ws: wsRoutes.length,
      layouts: layouts.size,
    },
    bundleSize,
    clientHash,
    stylesHash,
  };

  const metadataPath = join(axiDir, ".built");
  await Bun.write(metadataPath, JSON.stringify(metadata, null, 2));

  const duration = Date.now() - startTime;
  console.log("");
  console.log(` ✓ Build completed in ${duration}ms`);
  console.log("");
  console.log("   Ready for production! Run 'axi start' to serve.");
  console.log("");
}

/**
 * Check if build artifacts exist and are valid
 */
export async function hasBuildArtifacts(): Promise<boolean> {
  // Simply check if valid build metadata exists
  // If metadata is valid, we can trust all artifacts exist
  const metadata = await getBuildMetadata();
  return metadata !== null;
}

/**
 * Read and validate build metadata
 */
export async function getBuildMetadata(): Promise<BuildMetadata | null> {
  const metadataPath = join(process.cwd(), ".axi", ".built");

  if (!(await fileExists(metadataPath))) {
    return null;
  }

  try {
    const file = Bun.file(metadataPath);
    const content = await file.text();
    const data = JSON.parse(content);

    // Validate structure
    if (
      !data ||
      typeof data.timestamp !== "number" ||
      typeof data.version !== "string" ||
      !data.routes ||
      typeof data.bundleSize !== "number" ||
      typeof data.clientHash !== "string"
    ) {
      console.warn("Invalid build metadata structure");
      return null;
    }

    // Ensure stylesHash exists (default to empty string for backwards compat)
    if (typeof data.stylesHash !== "string") {
      data.stylesHash = "";
    }

    return data as BuildMetadata;
  } catch (error) {
    console.warn(`Failed to read build metadata: ${getErrorMessage(error)}`);
    return null;
  }
}
