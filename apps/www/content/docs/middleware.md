---
title: Middleware
description: Add middleware to your API routes
order: 11
category: API Routes
---

## Creating Middleware

Create a middleware function:

```typescript
import { route, defineMiddleware } from "@axi/core";

const logger = defineMiddleware((ctx) => {
  console.log(`${ctx.method} ${ctx.url}`);
  // Return nothing to continue
});

export const getMessage = route
  .get()
  .use(logger)
  .handle(async (ctx) => {
    return { message: "Hello" };
  });
```

Middleware is just a function receiving the route context. For full type inference, wrap it with `defineMiddleware` (it infers the context extras your middleware adds):

```typescript
import { route, defineMiddleware } from "@axi/core";

const withUser = defineMiddleware(async (ctx) => {
  return { user: await loadUser(ctx) };
});
```

A middleware can:

- **Return data** (an object) - merged into the context for downstream middleware and the handler
- **Return a `Response`** - short-circuits the request (e.g. `redirect("/login")` or a 401)
- **Return nothing** - continues without adding to the context

## Adding Context

Middleware can add data to the context:

```typescript
import { route, defineMiddleware } from "@axi/core";

const authMiddleware = defineMiddleware(async (ctx) => {
  const token = ctx.headers.get("authorization");

  if (!token) {
    // Return a Response to short-circuit the request
    return new Response("Unauthorized", { status: 401 });
  }

  // Return data to add to context
  return {
    user: { id: "123", name: "John" },
  };
});

export const getCurrentUser = route
  .get()
  .use(authMiddleware)
  .handle(async (ctx) => {
    // ctx.user is now available
    return { user: ctx.user };
  });
```

## Multiple Middleware

Chain multiple middleware:

```typescript
import { route, defineMiddleware } from "@axi/core";

const auth = defineMiddleware(async (ctx) => {
  return { user: { id: "123" } };
});

const timing = defineMiddleware(async (ctx) => {
  const start = Date.now();
  return { requestTime: start };
});

export const getUserWithTiming = route
  .get()
  .use(auth)
  .use(timing)
  .handle(async (ctx) => {
    return {
      user: ctx.user,
      requestTime: ctx.requestTime,
    };
  });
```

## Error Handling

Middleware short-circuits by returning a `Response`. For structured errors, use `ApiError` or the `errors` factory — they're converted to a proper error response automatically:

```typescript
import { route, errors } from "@axi/core";
import type { AxiRequest } from "@axi/core";

const requireAdmin = async (ctx: AxiRequest & { user?: { isAdmin?: boolean } }) => {
  if (!ctx.user?.isAdmin) {
    // Returns a 403 Problem Details response
    throw errors.forbidden();
  }
};

export const deleteResource = route
  .delete()
  .use(authMiddleware)
  .use(requireAdmin)
  .handle(async (ctx) => {
    // Only admins reach here
    return { deleted: true };
  });
```

## Async Middleware

Middleware supports async operations:

```typescript
import { route, defineMiddleware, errors } from "@axi/core";

const loadUser = defineMiddleware(async (ctx) => {
  const userId = ctx.params.id;
  const user = await db.users.findById(userId);

  if (!user) {
    throw errors.notFound("User");
  }

  return { user };
});

export const getUser = route
  .get()
  .use(loadUser)
  .handle(async (ctx) => {
    // ctx.user is loaded from database
    return { user: ctx.user };
  });
```

## Reusable Middleware

Create reusable middleware:

```typescript
// middleware/auth.ts
import { defineMiddleware, errors } from "@axi/core";

export const requireAuth = defineMiddleware(async (ctx) => {
  const token = ctx.headers.get("authorization");

  if (!token) {
    throw errors.unauthorized();
  }

  const user = await verifyToken(token);
  return { user };
});

// middleware/rateLimit.ts
import { defineMiddleware, errors } from "@axi/core";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = defineMiddleware(async (ctx) => {
  const ip = ctx.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const limit = requestCounts.get(ip);

  if (limit && now < limit.resetAt && limit.count >= 100) {
    throw errors.rateLimit();
  }

  requestCounts.set(ip, {
    count: (limit?.count ?? 0) + 1,
    resetAt: limit?.resetAt ?? now + 60000,
  });
});
```

Use in routes:

```typescript
import { requireAuth } from "@/middleware/auth";
import { rateLimit } from "@/middleware/rateLimit";

export const getProtectedUser = route
  .get()
  .use(rateLimit)
  .use(requireAuth)
  .handle(async (ctx) => {
    return { user: ctx.user };
  });
```

> **Note:** For CORS configuration, use `axi.config.ts` instead of middleware. See [Configuration](/docs/configuration#cors) for details.

## Conditional Middleware

Apply middleware conditionally:

```typescript
import { route, defineMiddleware } from "@axi/core";

const optionalAuth = defineMiddleware(async (ctx) => {
  const token = ctx.headers.get("authorization");

  if (token) {
    const user = await verifyToken(token);
    return { user };
  }

  return { user: null };
});

export const getGreeting = route
  .get()
  .use(optionalAuth)
  .handle(async (ctx) => {
    if (ctx.user) {
      return { message: `Hello, ${ctx.user.name}` };
    }
    return { message: "Hello, guest" };
  });
```
