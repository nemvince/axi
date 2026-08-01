# Axi Website

The official marketing and documentation website for [Axi](https://github.com/nemvince/axi).

## About

This is the main website for Axi, featuring:

- **Marketing Homepage** - Introduction to Axi with features and quick start
- **Documentation** - Guides for every part of the framework

Built with Axi itself and styled with Tailwind CSS v4.

## Development

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun build

# Start production server
bun start
```

The site will be available at `http://localhost:3002`.

## Project Structure

```
apps/www/
├── app/                    # Application routes
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout
│   ├── docs/              # Documentation pages
│   │   ├── layout.tsx
│   │   └── [slug]/page.tsx
│   └── index.css          # Global styles
├── components/            # React components
│   ├── ui/               # UI components
│   ├── navigation.tsx
│   ├── footer.tsx
│   ├── features-grid.tsx
│   ├── docs-sidebar.tsx
│   └── markdown-content.tsx
├── content/              # Markdown content
│   └── docs/            # Documentation files
├── lib/                 # Utilities
│   ├── utils.ts
│   └── docs.ts
└── public/              # Static assets
```

## Adding Documentation

Create a new markdown file in `content/docs/`:

```markdown
---
title: Your Doc Title
description: A short description
order: 1
category: Getting Started
---

# Your Content Here
```

The file will be automatically available at `/docs/filename` (without the `.md` extension).

> **Note:** The docs sidebar menu is a hard-coded list in `components/docs-sidebar.tsx`. Add an entry there (and a corresponding file in `content/docs/`) when adding a new page so it appears in navigation.

## License

MIT
