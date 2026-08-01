#!/usr/bin/env bun
/**
 * Axi CLI - Entry point for axi dev and axi start
 */

import { resolveConfig, type AxiConfig } from "../src/core/config";
import { buildServerConfig } from "../src/core/server";

// Parse CLI arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || !["dev", "start", "build"].includes(command)) {
  console.error(`
Usage: axi <command> [options]

Commands:
  dev     Start development server with HMR
  start   Start production server
  build   Build production artifacts

Options:
  --port <number>       Server port (default: 3000)
  --hostname <string>   Server hostname (default: localhost)
  --app-dir <path>      Path to app directory (default: ./app)
  --ws-dir <path>       Path to WebSocket directory (default: ./app/ws)

Examples:
  axi dev
  axi start --port 8080
  axi build
  axi dev --app-dir ./src/app
`);
  process.exit(1);
}

// Parse CLI flags
const cliConfig: AxiConfig = {};
for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  const next = args[i + 1];

  if (arg === "--port" && next) {
    cliConfig.port = parseInt(next, 10);
    i++;
  } else if (arg === "--hostname" && next) {
    cliConfig.hostname = next;
    i++;
  } else if (arg === "--app-dir" && next) {
    cliConfig.appDir = next;
    i++;
  } else if (arg === "--ws-dir" && next) {
    cliConfig.wsDir = next;
    i++;
  }
}

// Handle build command separately
if (command === "build") {
  const { buildForProduction } = await import("../src/core/build");
  const config = await resolveConfig(cliConfig, false);
  await buildForProduction(config);
  process.exit(0);
}

// Resolve configuration
const development = command === "dev";
const config = await resolveConfig(cliConfig, development);

// Print header
console.log("");
console.log("   📦 Axi");
console.log(`   - Local:   http://${config.hostname}:${config.port}`);
console.log("");
console.log(" ○ Starting...");

// Build server config
const serverConfig = await buildServerConfig(config);

// Print ready message
console.log(serverConfig.readyMessage);

// Start HTTP server
Bun.serve(serverConfig);
