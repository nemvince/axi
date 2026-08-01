/**
 * Production bundle tests
 * Ensures the browser bundle ships React's production build (not the
 * development build) by defining process.env.NODE_ENV when bundling.
 */

import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { transpileForBrowser } from "../../src/core/utils";

// Dev-only string present in React's development bundle (react.development.js),
// absent from the production build. Used to detect whether the bundle ships the
// dev or prod build of React.
const REACT_DEV_MARKER = "react-stack-top-frame";

const ENTRY = `
  import { useState } from "react";
  import { createRoot } from "react-dom/client";
  export function App() {
    useState(0);
    return null;
  }
`;

describe("production client bundle", () => {
  test("excludes React's development build when production: true", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axi-bundle-prod-"));
    try {
      const entry = join(dir, "entry.tsx");
      await writeFile(entry, ENTRY);

      const result = await transpileForBrowser([entry], { production: true });

      expect(result.success).toBe(true);
      expect(result.output).not.toContain(REACT_DEV_MARKER);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("keeps React's development build when production: false", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axi-bundle-dev-"));
    try {
      const entry = join(dir, "entry.tsx");
      await writeFile(entry, ENTRY);

      const result = await transpileForBrowser([entry], { production: false });

      expect(result.success).toBe(true);
      expect(result.output).toContain(REACT_DEV_MARKER);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
