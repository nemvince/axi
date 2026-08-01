/**
 * Optional Axi configuration
 * All fields are optional and have sensible defaults
 */

import type { AxiConfig } from "@axi-js/core";

const config: AxiConfig = {
  port: 3000,
  hostname: "localhost",
  appDir: "./app",
  publicDir: "./public", // Static assets served at root (e.g., /robots.txt)
  openapi: {
    enabled: true,
    title: "Axi Basic Example API",
    version: "1.0.0",
  },
};

export default config;
