---
title: Installation
description: Get started with Axi in minutes
order: 2
---

## Prerequisites

Before you begin, make sure you have [Bun](https://bun.sh) installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

## Create a New Project

Create a new project with `bun create`:

```bash
bun create axi my-app
cd my-app
bun install
```

This will create a new Axi project with all the necessary dependencies.

## Start Development Server

Start the development server:

```bash
bun dev
```

Your app will be available at `http://localhost:3000`.

## Project Structure

A typical Axi project looks like this:

```
my-app/
├── app/
│   ├── page.tsx          # Home page (/)
│   ├── layout.tsx        # Root layout
│   ├── index.css         # Global styles
│   ├── about/
│   │   └── page.tsx      # About page (/about)
│   └── api/
│       └── users/
│           └── route.ts  # API route (/api/users)
├── public/
│   └── robots.txt        # Static files
├── axi.config.ts      # Configuration
├── package.json
└── tsconfig.json
```

## Configuration

Axi works with zero configuration, but you can customize it using `axi.config.ts`:

```typescript
import type { AxiConfig } from "@axi-js/core";

const config: AxiConfig = {
  port: 3000,
  appDir: "./app",
  publicDir: "./public",
};

export default config;
```

## What's Next?

- Learn about [routing](/docs/routing) and file-based navigation
- Create your first [API route](/docs/api-routes)
- Explore [Data Loading](/docs/data-loading)
