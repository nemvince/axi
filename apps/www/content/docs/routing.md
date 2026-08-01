---
title: Routing
description: Learn about file-based routing in Axi - where the structure of your `app/` directory determines your application's routes.
order: 4
category: Core Concepts
---

## Basic Routing

Create a `page.tsx` file in any directory to define a route:

```
app/
├── page.tsx              -> /
├── about/
│   └── page.tsx          -> /about
└── blog/
    └── page.tsx          -> /blog
```

## Dynamic Routes

Use square brackets `[param]` to create dynamic routes:

```
app/
└── blog/
    └── [slug]/
        └── page.tsx      -> /blog/:slug
```

Access the parameter in your component:

```tsx
interface BlogPostProps {
  params: { slug: string };
}

export default function BlogPost({ params }: BlogPostProps) {
  return <h1>Post: {params.slug}</h1>;
}
```

## Catch-All Routes

Use `[...param]` to match one or more path segments (the "catch-all" syntax):

```
app/
└── docs/
    └── [...slug]/
        └── page.tsx      -> /docs/* (e.g. /docs/guide/getting-started)
```

The parameter is an **array** of the matched segments:

```tsx
interface DocsProps {
  params: { slug: string[] };
}

export default function Docs({ params }: DocsProps) {
  return <h1>Docs: {params.slug.join(" / ")}</h1>;
}
```

Use `[[...param]]` to match **zero or more** segments, so the parent path also matches:

```
app/
└── docs/
    └── [[...slug]]/
        └── page.tsx      -> /docs AND /docs/guide/getting-started
```

With an optional catch-all, `params.slug` is an empty array (`[]`) when the path has no remaining segments.

Catch-all routes work for pages, API routes, and WebSockets. For API routes, validate the array with a schema:

```typescript
// app/api/files/[...path]/route.ts
import { route } from "@axi/core";
import { z } from "zod";

const Params = z.object({ path: z.array(z.string()) });

export const getFile = route
  .get()
  .params(Params)
  .handle(({ params }) => ({
    path: params.path, // string[]
  }));
```

The generated client accepts an array for the catch-all param:

```tsx
const { data } = api.files.getFile.useQuery({ path: ["assets", "logo.png"] });
// fetches /api/files/assets/logo.png
```

> A catch-all segment is intended to be the last segment of a route.

## Nested Routes

Create nested routes by nesting directories:

```
app/
└── dashboard/
    ├── page.tsx          -> /dashboard
    ├── settings/
    │   └── page.tsx      -> /dashboard/settings
    └── profile/
        └── page.tsx      -> /dashboard/profile
```

## Query Parameters

Access query parameters through the `query` prop:

```tsx
interface PageProps {
  query: Record<string, string>;
}

export default function SearchPage({ query }: PageProps) {
  return <div>Search: {query.q}</div>;
}
```

Visit `/search?q=axi` to see "Search: axi".

## Navigation

Use regular anchor tags for navigation:

```tsx
<a href="/about">About</a>
<a href="/blog/my-post">Blog Post</a>
```

## Route Priority

When multiple routes could match a URL, Axi uses this priority:

1. Static routes (exact matches)
2. Dynamic routes (with single parameters)
3. Catch-all routes (`[...param]`)

More specific routes always take precedence over less specific ones. For example, with both `blog/[slug]/page.tsx` and `blog/[...rest]/page.tsx`, the single-parameter route handles `/blog/my-post` while the catch-all handles `/blog/a/b/c`.
