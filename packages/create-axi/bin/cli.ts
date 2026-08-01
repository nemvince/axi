#!/usr/bin/env bun
/**
 * create-axi CLI
 * Usage: bunx create-axi [project-name] [options]
 */

import { runCLI } from "../src/index";

const pkg = await import("../package.json");

// Parse CLI arguments
const args = process.argv.slice(2);

// Extract options and project name
const options: {
  projectName?: string;
  template?: string;
  skipGit?: boolean;
  skipInstall?: boolean;
} = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  const next = args[i + 1];

  if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else if (arg === "--version" || arg === "-v") {
    console.log(pkg.version);
    process.exit(0);
  } else if ((arg === "--template" || arg === "-t") && next) {
    options.template = next;
    i++;
  } else if (arg === "--skip-git") {
    options.skipGit = true;
  } else if (arg === "--skip-install") {
    options.skipInstall = true;
  } else if (arg && !arg.startsWith("-")) {
    options.projectName = arg;
  }
}

await runCLI(options);

function printHelp() {
  console.log(`
  create-axi v${pkg.version}

  Create a new Axi project with a single command.

  Usage: create-axi [project-name] [options]

  Options:
    -t, --template <name>  Template to use (basic, tailwind)
    --skip-git             Skip git initialization
    --skip-install         Skip dependency installation
    -h, --help             Show this help message
    -v, --version          Show version number

  Examples:
    bunx create-axi my-app
    bunx create-axi my-app --template tailwind
    bunx create-axi my-app -t tailwind --skip-install
`);
}
