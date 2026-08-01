<div align="center">

# 🐢 Axi

Fullstack's flow state. A full-stack TypeScript framework built on [Bun](https://bun.sh). File-based routing, type-safe APIs, and real-time WebSockets.

<h3>

[Homepage](https://axi.vnce.eu) | [Documentation](https://axi.vnce.eu/docs/introduction)

</h3>

[![npm version](https://img.shields.io/npm/v/@axi-js/core.svg)](https://www.npmjs.com/package/@axi-js/core)

</div>

---

- **File-based routing** for pages, APIs, and WebSockets
- **Type-safe APIs** with an auto-generated typed client
- **Real-time WebSockets** built on Bun's native primitives with pub/sub
- **Server-side rendering** with React and full client hydration
- **Server data loading** with `loader` functions
- **Zero config** - works out of the box

---

## Getting Started

```bash
bun create axi my-app   # scaffolds a project (create-axi)
cd my-app
bun dev                 # or: axi dev
```

---

## Quick examples

### Pages

Create a file, get a route. Pages are server-rendered and hydrated on the client.

```tsx
// app/page.tsx
export default function Home() {
  return <h1>Hello World</h1>;
}
```

→ `http://localhost:3000/`

```tsx
// app/about/page.tsx
export default function About() {
  return <h1>About Us</h1>;
}
```

→ `http://localhost:3000/about`

Catch-all segments match one or more path segments:

```tsx
// app/docs/[...slug]/page.tsx
export default function Docs({ params }: { params: { slug: string[] } }) {
  return <h1>{params.slug.join(" / ")}</h1>;
}
```

→ `http://localhost:3000/docs/guide/getting-started`

### Type-safe APIs

Define an API route with the route builder and get a fully typed client automatically.

```typescript
// app/api/users/[id]/route.ts
import { route } from "@axi-js/core";
import { z } from "zod";

const Params = z.object({ id: z.string() });
const Query = z.object({ include: z.string().optional() });

export const getUser = route
  .get()
  .params(Params)
  .query(Query)
  .handle(({ params, query }) => ({
    id: params.id,
    name: "John Doe",
    email: query.include === "email" ? "john@example.com" : undefined,
  }));
```

The dev/build process generates `.axi/api-client.ts` with an `api` object that mirrors your routes. Use it from the client with full type safety and flattened options:

```tsx
// app/profile/page.tsx
import { api } from "@/.axi/api-client";

export default function Profile() {
  const { data } = api.users.getUser.useQuery({
    id: "123", // params are flattened
    include: "email", // query params are flattened too!
  });

  return <div>{data?.email}</div>; // data is fully typed!
}
```

### Real-time WebSockets

Create a WebSocket route by exporting `upgrade`, `onOpen`, `onMessage`, and `onClose` from a `route.ts` in `app/ws/`:

```typescript
// app/ws/chat/route.ts
import type { ServerWebSocket, WebSocketContext } from "@axi-js/core";

export function onMessage(
  ws: ServerWebSocket,
  message: string | Buffer,
  ctx: WebSocketContext
) {
  // Broadcast to every connection subscribed to this route's topic
  ctx.broadcast(message);
}
```

This creates a WebSocket at `ws://localhost:3000/ws/chat`. Every connection is automatically subscribed to the route topic, and `ctx.broadcast()` / `ctx.broadcastJSON()` publish to all of them.

---

## Core features

### Route middleware & validation

Attach middleware with `.use()` and validate `params`, `query`, and `body` with any Zod-compatible schema:

```typescript
// app/api/orders/route.ts
import { route, defineMiddleware } from "@axi-js/core";
import { z } from "zod";

const requireAuth = defineMiddleware(async (ctx) => {
  const token = ctx.headers.get("authorization");
  if (!token) return new Response("Unauthorized", { status: 401 });
  return { user: await verifyToken(token) };
});

export const createOrder = route
  .post()
  .use(requireAuth)
  .body(z.object({ items: z.array(z.string()) }))
  .handle(({ body, user }) => {
    return { orderId: createOrder(user.id, body.items) };
  });
```

### File-based page middleware

Protect pages and share data across routes by exporting a `middleware` function from any `middleware.ts` file in `app/`:

```typescript
// app/middleware.ts - runs for every page
import { redirect, getCookie } from "@axi-js/core";
import type { MiddlewareContext } from "@axi-js/core";

export async function middleware({ request }: MiddlewareContext) {
  if (!getCookie(request, "auth_token")) return redirect("/auth/login");
  return { user: await getCurrentUser(request) }; // available to loaders/pages
}
```

### Streaming & SSE

Stream raw chunks with `stream()` or structured events with `sse()`, then consume them client-side with `useStream`:

```typescript
// app/api/stream/route.ts
import { route, sse, type SSEResponse } from "@axi-js/core";

export const streamTokens = route.get().handle((): SSEResponse<{ token: string }> => {
  return sse(async function* () {
    for (const chunk of await generateAI(prompt)) yield { token: chunk };
  });
});
```

```tsx
// app/chat/page.tsx
import { api } from "@/.axi/api-client";

export default function Chat() {
  const { data } = api.stream.streamTokens.useStream();
  return <p>{data.map((d) => d.token).join("")}</p>;
}
```

### Error handling

`ApiError` and the `errors` factory produce RFC 7807 Problem Details responses. Validation failures are caught automatically:

```typescript
import { route, errors } from "@axi-js/core";

export const removeUser = route.delete().handle(() => {
  if (!isAdmin()) throw errors.forbidden();
  throw errors.notFound("User");
});
```

### CORS & OpenAPI

Both are enabled from `axi.config.ts`:

```typescript
import type { AxiConfig } from "@axi-js/core";

const config: AxiConfig = {
  cors: { origin: "https://app.example.com", credentials: true },
  openapi: { enabled: true, title: "My API", version: "1.0.0" }, // Swagger UI at /api/docs
};

export default config;
```

### Theme system

`@axi-js/core/theme` ships an SSR-safe `ThemeProvider` and `useTheme` hook with flash-free light/dark/system theming:

```tsx
import { ThemeProvider, useTheme } from "@axi-js/core/theme";

export function App() {
  return <ThemeProvider defaultTheme="system">{/* ... */}</ThemeProvider>;
}
```

### Client hooks

`@axi-js/core/client` provides `useRouter`, `useParams`, `navigate`, `redirect`, `useIsClient`, `useClientEffect`, and `useStream`. The generated client adds `useQuery` to every API method.

---

## Why Axi?

- **Fast to start** - Zero config. Create a project and start building.
- **Fast to run** - Built on Bun with millisecond startup.
- **Type-safe by default** - Types flow from server to client automatically.
- **Small and readable** - The entire framework is small enough to understand.

Axi combines patterns from Next.js (file-based routing) and tRPC (end-to-end types) into a single, minimal framework, with real-time WebSockets built directly on Bun's native primitives.

---

## CLI

- `axi dev` - Development server with hot reload
- `axi build` - Production build with hashed assets
- `axi start` - Production server

## Examples

- [examples/basic](./examples/basic) - Pages, layouts, loaders, API routes, and streaming
- [examples/with-tailwind](./examples/with-tailwind) - Styled with Tailwind CSS v4 and shadcn/ui
