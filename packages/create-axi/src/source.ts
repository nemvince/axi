import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "fs/promises";
import { downloadTemplate } from "giget";
import { join, resolve } from "path";

const GITHUB_REPO = "nemvince/axi";

export const TEMPLATES = {
  basic: "basic",
  tailwind: "with-tailwind",
} as const;

export type TemplateName = keyof typeof TEMPLATES;

// Files never copied into a scaffolded project.
const GENERATED_PATHS = [
  "node_modules",
  ".axi",
  "dist",
  "build",
  "bun.lock",
  "bun.lockb",
];

// Mirrors the `catalog` field in the monorepo root package.json so `catalog:`
// references in examples can be inlined into real version ranges.
const CATALOG: Record<string, string> = {
  "@types/bun": "^1.3.14",
  "@types/react": "^19.2.18",
  "@types/react-dom": "^19.2.4",
  react: "^19.2.8",
  "react-dom": "^19.2.8",
  typescript: "^7.0.2",
};

// Fallback if the npm lookup fails. Keep in sync with the latest published release.
const AXI_VERSION_FALLBACK = "^0.1.0";

export function getAvailableTemplates(): string[] {
  return Object.keys(TEMPLATES);
}

export async function fetchTemplate(
  templateName: TemplateName,
  destPath: string,
  projectName: string
) {
  const exampleDir = TEMPLATES[templateName];

  // AXI_EXAMPLES_DIR lets the CLI be tested against local examples
  // instead of the published GitHub repository (e.g. during monorepo dev).
  const localExamplesDir = process.env.AXI_EXAMPLES_DIR;
  if (localExamplesDir) {
    await copyDirectory(resolve(localExamplesDir, exampleDir), destPath);
  } else {
    try {
      await downloadTemplate(`${GITHUB_REPO}/examples/${exampleDir}`, {
        dir: destPath,
        force: false,
        silent: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("404")) {
        throw new Error(`Template "${templateName}" does not exist.`);
      }
      throw error;
    }
  }

  await cleanGeneratedFiles(destPath);
  await postProcessPackageJson(destPath, projectName);
}

async function copyDirectory(src: string, dest: string) {
  await mkdir(dest, { recursive: true });

  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (GENERATED_PATHS.includes(entry.name)) continue;

    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function cleanGeneratedFiles(destPath: string) {
  await Promise.all(
    GENERATED_PATHS.map((name) =>
      rm(join(destPath, name), { recursive: true, force: true })
    )
  );
}

async function postProcessPackageJson(destPath: string, projectName: string) {
  const pkgPath = join(destPath, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));

  pkg.name = projectName;
  pkg.version = "0.1.0";

  for (const section of ["dependencies", "devDependencies"]) {
    const deps: Record<string, string> = pkg[section];
    if (!deps) continue;

    for (const [dep, range] of Object.entries(deps)) {
      if (dep === "@axi/core") {
        deps[dep] = await resolveAxiVersion();
      } else if (range === "catalog:") {
        const version = CATALOG[dep];
        if (!version) {
          throw new Error(
            `No catalog version mapped for "${dep}". Add it to CATALOG in src/source.ts.`
          );
        }
        deps[dep] = version;
      }
    }
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

async function resolveAxiVersion(): Promise<string> {
  try {
    const proc = Bun.spawn(
      ["bun", "pm", "view", "@axi/core", "version"],
      { stdout: "pipe", stderr: "pipe" }
    );
    await proc.exited;
    const version = (await new Response(proc.stdout).text()).trim();
    if (proc.exitCode === 0 && /^\d+\.\d+\.\d+/.test(version)) {
      return `^${version}`;
    }
  } catch {}

  return AXI_VERSION_FALLBACK;
}
