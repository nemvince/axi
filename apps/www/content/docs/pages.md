---
title: Pages
description: Creating and organizing pages in Axi
order: 5
category: Core Concepts
---

## Creating a Page

Create a `page.tsx` file to define a page:

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to our about page!</p>
    </div>
  );
}
```

This creates a page at `/about`.

## Page Props

Pages receive `params`, `query`, and `data` as props:

```tsx
import type { PageProps } from "@axi-js/core";

export default function Page({ params, query, data }: PageProps) {
  return (
    <div>
      <h1>Params: {JSON.stringify(params)}</h1>
      <p>Query: {JSON.stringify(query)}</p>
      <p>Data: {JSON.stringify(data)}</p>
    </div>
  );
}
```

## Data Loading with Loaders

Use the `loader` export for server-side data fetching:

```tsx
import type { LoaderContext, PageProps } from "@axi-js/core";

// Loader runs on the server
export async function loader({ params, query }: LoaderContext) {
  const user = await db.getUser(params.id);
  return { user };
}

// Page receives loader data via props.data
export default function UserPage({ params, data }: PageProps) {
  const { user } = data as { user: User };

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

Loaders run:
- On the server for initial page loads
- On the server via fetch for client-side navigation

## Page Metadata

Export metadata for SEO:

```tsx
import type { PageMetadata } from "@axi-js/core";

export const metadata: PageMetadata = {
  title: "About Us",
  description: "Learn more about our company",
  keywords: ["about", "company"],
};

export default function AboutPage() {
  return <div>About Us</div>;
}
```

## Interactive Components

All pages are fully hydrated and support React hooks:

```tsx
import { useState } from "react";

export default function CounterPage() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## Combining Loaders with Interactivity

Use loaders for initial data, React state for client interactions:

```tsx
import { useState } from "react";
import type { LoaderContext, PageProps } from "@axi-js/core";

export async function loader({ params }: LoaderContext) {
  const posts = await db.getPosts();
  return { posts };
}

export default function BlogPage({ data }: PageProps) {
  const { posts } = data as { posts: Post[] };
  const [filter, setFilter] = useState("");

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search posts..."
      />
      {filteredPosts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}
```

## Not Found Pages

If no route matches a URL, the client router renders a default 404 page:

```tsx
// The default 404 shown when no route matches
<h1>404 - Page Not Found</h1>
<p>The page you're looking for doesn't exist.</p>
```

For a page without a matching route, the server returns a plain `404 Not Found` response. There's currently no built-in way to customize the 404 page.
