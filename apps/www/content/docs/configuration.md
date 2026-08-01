---
title: Configuration
description: Configure your Axi application
order: 13
category: Advanced
---

## Basic Configuration

Create `axi.config.ts` in your project root. It's a plain object that you type with `AxiConfig` and export as the default:

```typescript
import type { AxiConfig } from "@axi-js/core";

const config: AxiConfig = {
  port: 3000,
  appDir: "./app",
  publicDir: "./public",
};

export default config;
```

## Configuration Options

### port

The port to run the server on.

- Type: `number`
- Default: `3000`

```typescript
const config: AxiConfig = {
  port: 8080,
};
```

### hostname

The hostname to bind the server to.

- Type: `string`
- Default: `"localhost"`

```typescript
const config: AxiConfig = {
  hostname: "0.0.0.0",
};
```

### appDir

The directory containing your application code.

- Type: `string`
- Default: `"./app"`

```typescript
const config: AxiConfig = {
  appDir: "./src/app",
};
```

### wsDir

The directory containing WebSocket routes.

- Type: `string`
- Default: `"./app/ws"`

```typescript
const config: AxiConfig = {
  wsDir: "./src/ws",
};
```

### publicDir

The directory containing static files. Files are served at the URL root.

- Type: `string`
- Default: `"./public"`

```typescript
const config: AxiConfig = {
  publicDir: "./static",
};
```

### maxBodySize

Maximum request body size in bytes.

- Type: `number`
- Default: `1048576` (1MB)

Requests that exceed this size return a `413 Payload Too Large` error.

```typescript
const config: AxiConfig = {
  maxBodySize: 10 * 1024 * 1024, // 10MB
};
```

### cors

Configure CORS (Cross-Origin Resource Sharing) for API routes.

- Type: `boolean | CorsConfig`
- Default: `undefined` (disabled)

Enable with permissive defaults (allows all origins):

```typescript
const config: AxiConfig = {
  cors: true,
};
```

Or configure specific options:

```typescript
const config: AxiConfig = {
  cors: {
    origin: "https://example.com",        // Allowed origin(s)
    methods: ["GET", "POST"],             // Allowed methods
    allowedHeaders: ["Content-Type"],     // Allowed request headers
    exposedHeaders: ["X-Custom-Header"],  // Headers exposed to browser
    credentials: true,                    // Allow credentials
    maxAge: 86400,                        // Preflight cache duration (seconds)
  },
};
```

#### CORS Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `origin` | `string \| string[] \| (origin: string) => boolean` | `"*"` | Allowed origins |
| `methods` | `string[]` | `["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]` | Allowed HTTP methods |
| `allowedHeaders` | `string[]` | `["Content-Type", "Authorization"]` | Headers the client can send |
| `exposedHeaders` | `string[]` | `[]` | Headers exposed to the client |
| `credentials` | `boolean` | `false` | Allow cookies/auth headers |
| `maxAge` | `number` | `86400` | Preflight response cache time |

#### Dynamic Origin Validation

Use a function for dynamic origin validation:

```typescript
const config: AxiConfig = {
  cors: {
    origin: (origin) => {
      const allowed = ["https://app.example.com", "https://admin.example.com"];
      return allowed.includes(origin);
    },
    credentials: true,
  },
};
```

#### Multiple Origins

Allow specific origins:

```typescript
const config: AxiConfig = {
  cors: {
    origin: ["https://app.example.com", "https://admin.example.com"],
  },
};
```

### openapi

Enable auto-generated OpenAPI documentation and Swagger UI for your API routes.

- Type: `OpenAPIConfig`
- Default: `undefined` (disabled)

```typescript
const config: AxiConfig = {
  openapi: {
    enabled: true,
    title: "My API",
    version: "1.0.0",
    description: "My API documentation",
  },
};
```

When enabled, two endpoints are served:

- `/api/docs` - Interactive Swagger UI
- `/api/docs/openapi.json` - The generated OpenAPI 3.1 spec

See [OpenAPI & Swagger](/docs/openapi) for details.

## Environment Variables

Use `.env` files for environment-specific configuration:

```bash
# .env
DATABASE_URL=postgresql://localhost/mydb
API_KEY=your-secret-key
```

Access in your code:

```typescript
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;
```

The `PORT` environment variable overrides the configured `port` (useful for platforms that assign a random port).

## TypeScript Configuration

Customize TypeScript with `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "esnext",
    "target": "esnext",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

The `@/*` alias pointing at the project root lets you import the generated client as `@/.axi/api-client`.

## Build Configuration

Run `axi build` to create a production bundle:

- Minifies JavaScript and CSS
- Hashes client and styles bundles for immutable caching
- Generates the client entry point and typed API client

The production server is started with `axi start`. No additional configuration needed!
