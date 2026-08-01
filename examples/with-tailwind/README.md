# with-tailwind

A [Axi](https://github.com/nemvince/axi) example app styled with Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com) components.

## Running the Example

```bash
# Install dependencies
bun install

# Start dev server
bun dev
```

## What's Included

- **Axi** - pages and layouts with SSR and hydration
- **Tailwind CSS v4** - wired up via `bun-plugin-tailwind` in `bunfig.toml`
- **shadcn/ui components** - button, card, input, label, badge, separator, slider, switch, and tabs

## Structure

```
app/
├── page.tsx       # Home page
├── layout.tsx     # Root layout
├── index.css      # Tailwind + theme styles
components/
└── ui/            # shadcn/ui components
lib/
└── utils.ts       # cn() helper
```
