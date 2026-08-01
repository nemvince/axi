---
title: Welcome to Axi
description: Introducing Axi - a simple full-stack framework built on Bun
date: 2024-11-24
author: Tamas Vince
published: true
---

# Welcome to Axi

We're excited to introduce **Axi**, a simple full-stack framework built on [Bun](https://bun.sh). Axi aims to make building React applications faster and simpler than ever before.

## Why We Built Axi

Modern web frameworks have become increasingly complex. Setting up a project, understanding the configuration, and navigating through layers of abstraction can be overwhelming. We built Axi to change that.

### Our Goals

1. **Simplicity First** - Zero configuration needed to get started
2. **Lightning Fast** - Built on Bun for maximum performance
3. **Type-Safe** - Full TypeScript support out of the box
4. **Batteries Included** - Everything you need is built-in

## What Makes Axi Different?

### File-Based Routing

Just create files in the `app/` directory, and they automatically become routes:

```
app/
├── page.tsx              -> /
├── about/page.tsx        -> /about
└── blog/[slug]/page.tsx  -> /blog/:slug
```

No configuration files, no manual route definitions. It just works.

### Built-In WebSocket Support

Real-time features shouldn't be difficult to add. Axi includes WebSocket support out of the box:

```typescript
// app/ws/chat/route.ts
import type { ServerWebSocket, WebSocketContext } from "@axi-js/core";

export function onMessage(
  ws: ServerWebSocket,
  message: string | Buffer,
  ctx: WebSocketContext
) {
  // Broadcast to every connection on this route
  ctx.broadcast(message);
}
```

Create a `route.ts` inside `app/ws/` and you get a WebSocket at `/ws/chat`, with automatic pub/sub topics and connection lifecycle hooks.

### Type-Safe API Routes

Create API endpoints with full type safety and validation:

```typescript
// app/api/users/route.ts
export const listUsers = route.get().handle(async (ctx) => {
  return { users: [] };
});
```

## Getting Started

Install Axi with a single command:

```bash
bun create axi my-app
cd my-app
bun dev
```

That's it! Your app is running at `http://localhost:3000`.

## What's Next?

We're just getting started. Here's what we're working on:

- Enhanced developer tools
- More examples and templates
- Improved documentation
- Community plugins

Join us on [GitHub](https://github.com/nemvince/axi) and help shape the future of Axi!

## Try It Today

Ready to build something amazing? Check out our [documentation](/docs/introduction) and start building with Axi today.

