# create-axi

Scaffold a new [Axi](https://github.com/nemvince/axi) project with a single command.

## Usage

```bash
bun create axi my-app
```

You'll be prompted to configure your project. Or pass options directly:

```bash
bun create axi my-app --template tailwind
```

## Templates

Templates are fetched live from the [Axi examples](https://github.com/nemvince/axi/tree/main/examples) on the `main` branch, so they always match the latest framework version.

| Template   | Description                                      |
| ---------- | ------------------------------------------------ |
| `basic`    | Simple pages, API routes, and streaming/SSR demos |
| `tailwind` | Tailwind CSS + shadcn/ui components              |

## Options

```
-t, --template <name>  Template to use (basic, tailwind)
--skip-git             Skip git initialization
--skip-install         Skip dependency installation
-h, --help             Show help message
-v, --version          Show version number
```

## Examples

```bash
# Interactive mode
bun create axi

# With project name
bun create axi my-app

# Specify template
bun create axi my-app -t tailwind

# Skip prompts
bun create axi my-app --template basic --skip-git --skip-install
```

## Requirements

- [Bun](https://bun.sh) >= 1.3.14

## License

MIT
