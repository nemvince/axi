---
title: OpenAPI & Swagger
description: Auto-generated OpenAPI documentation and Swagger UI for your API routes
order: 10.6
category: API Routes
---

## Overview

Axi can automatically generate an [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) spec from your API routes and serve an interactive Swagger UI. There's no setup beyond enabling it in your config.

## Enabling OpenAPI

Set `openapi.enabled` to `true` in `axi.config.ts`:

```typescript
import type { AxiConfig } from "@axi/core";

const config: AxiConfig = {
  openapi: {
    enabled: true,
    title: "My API",
    version: "1.0.0",
    description: "My API documentation",
    servers: [
      { url: "https://api.example.com", description: "Production" },
    ],
  },
};

export default config;
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable OpenAPI generation |
| `path` | `string` | `"/api/docs"` | Base path for docs endpoints |
| `title` | `string` | — | API title shown in the UI |
| `version` | `string` | — | API version |
| `description` | `string` | — | API description |
| `servers` | `Array<{ url, description? }>` | — | Server URLs |

## Endpoints

Once enabled, two endpoints are served:

- `/api/docs` - Interactive Swagger UI
- `/api/docs/openapi.json` - The raw OpenAPI 3.1 spec

## What Gets Generated

The spec is built by scanning every `route.ts` file in `app/api/`:

- **Methods** - Each `route.get()`, `route.post()`, etc. handler becomes an operation
- **Schemas** - Zod schemas passed to `.params()`, `.query()`, and `.body()` are converted to JSON Schema
- **Metadata** - Anything you provide via `.meta()`

### Adding Metadata

Use `.meta()` on a route to enrich its OpenAPI operation:

```typescript
import { route } from "@axi/core";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const createUser = route
  .post()
  .meta({
    summary: "Create a new user",
    description: "Creates a user with the provided details",
    tags: ["users"],
    operationId: "createUser",
    responses: {
      201: { description: "User created" },
      409: { description: "Email already exists" },
    },
  })
  .body(CreateUserSchema)
  .handle(async (ctx) => {
    return ctx.json({ user: ctx.body }, 201);
  });
```

Available `RouteMeta` fields:

- `summary` - Short summary of the operation
- `description` - Longer description
- `tags` - Tags used to group operations (defaults to the first path segment, e.g. `users`)
- `operationId` - Unique operation identifier
- `deprecated` - Mark the operation as deprecated
- `responses` - Response descriptions keyed by status code

## Zod to JSON Schema

Validation schemas are converted automatically. Supported Zod types include: strings (with min/max/length/format/regex/email/ip), numbers, booleans, enums, objects (with required fields), arrays, tuples, unions, intersections, records, maps, optionals, nullables, defaults, and more.

## Custom Path

Change the docs base path with the `path` option:

```typescript
const config: AxiConfig = {
  openapi: {
    enabled: true,
    path: "/api/documentation",
  },
};
```

Docs are then served at `/api/documentation` and `/api/documentation/openapi.json`.
