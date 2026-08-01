# Basic Axi Example

This is a basic example application demonstrating the features of Axi.

## Running the Example

```bash
# Development mode with hot reload
bun dev

# Production mode
bun start
```

## What's Included

- **Pages**: Static, dynamic, and server-rendered routes
- **Layouts**: Root layout with metadata
- **API Routes**: Typed routes with validation, streaming/SSE, and the auto-generated client
- **Styling**: Global CSS with modern styling

## Structure

```
app/
├── page.tsx              # Home page
├── layout.tsx            # Root layout
├── icon.webp             # Favicon
├── index.css             # Global styles
├── about/page.tsx        # About page
├── ssr-example/page.tsx  # Server-side rendered page with loader
├── stream-demo/page.tsx  # Streaming demo (useStream)
├── users/page.tsx        # useQuery demo
├── api/
│   ├── health/route.ts   # Health check endpoint
│   ├── examples/route.ts # Typed routes with middleware
│   ├── users/route.ts    # Users API with validation
│   └── stream/route.ts   # Streaming / SSE endpoint
└── public/               # Static assets
```

## What to Explore

- `app/users/page.tsx` - the generated API client's `useQuery` hook
- `app/stream-demo/page.tsx` - `useStream` for streaming/SSE
- `app/api/users/route.ts` - Zod validation and typed handlers
- `app/api/examples/route.ts` - route middleware with `route.use()`
- `app/ssr-example/page.tsx` - server `loader` functions
