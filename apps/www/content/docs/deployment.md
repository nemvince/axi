---
title: Deployment
description: Deploy your Axi application to production
order: 15
category: Advanced
---

Axi apps are plain Bun servers, so deploying them is just: **build an image, run it, and reverse-proxy it to the internet**. The scaffolded templates (`bun create axi`) ship a `Dockerfile` and `docker-compose.yml` to get you started.

## Quick start (Docker)

If you have a `Dockerfile` and `docker-compose.yml` (from a scaffolded template, or the ones below), this is all it takes:

```bash
docker compose up -d --build
```

Your app is now live at `http://<server>:3000`.

## What you get

The template ships three files:

| File                 | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| `Dockerfile`         | Multi-stage build: install → `axi build` → slim runtime image |
| `docker-compose.yml` | App service + optional Caddy sidecar for HTTPS      |
| `Caddyfile`          | Reverse-proxy config used by the Caddy sidecar      |

The `Dockerfile` is a standard Bun multi-stage build:

```dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --production --frozen-lockfile

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.axi ./.axi
COPY --from=build /app/app ./app
COPY --from=build /app/public ./public
COPY --from=build /app/axi.config.ts ./axi.config.ts
EXPOSE 3000
CMD ["bun", "run", "start"]
```

## Automatic HTTPS (Caddy)

To serve your app over HTTPS with a Let's Encrypt certificate:

1. Point your domain's **A record** at your server.
2. Uncomment the `caddy` service in `docker-compose.yml` and set `DOMAIN`.
3. Run:

```bash
docker compose up -d
```

Caddy terminates TLS on ports 80/443 and proxies to `app:3000`. It provisions and renews certificates automatically, so once DNS propagates your site is live at `https://your-domain.com`.

## Deploying to a VPS

```bash
# 1. Install Docker on the server
curl -fsSL https://get.docker.com | sh

# 2. Get the project onto the server (rsync, git clone, or scp)
git clone https://github.com/you/my-app.git && cd my-app

# 3. Build and run
docker compose up -d --build
```

For updates, `git pull` (or re-transfer files) then run the same command — Compose only rebuilds changed layers and restarts the container with zero manual steps.

To run **multiple apps** on one server, give each app a distinct host port (e.g. `"3001:3000"`) and let a shared Caddy (or nginx) route domains to each port.

## Deploying to a PaaS

Because the template includes a `Dockerfile`, it deploys to any container-based platform with no extra configuration:

### Fly.io

```bash
fly launch    # detects the Dockerfile, creates fly.toml
fly deploy
```

Axi binds to `PORT` from the environment, which is exactly how Fly routes traffic to your machine. Add a health check to `fly.toml`:

```toml
[[http_service.checks]]
  path = "/api/health"
  interval = "15s"
```

### Railway

```bash
railway init
railway up
```

Railway detects the `Dockerfile` and builds it. Expose the app on port `3000`.

### Cloud Run

```bash
gcloud run deploy my-app --source . --region us-central1 --allow-unauthenticated
```

Set the `PORT` env var to `8080` if you want Cloud Run's default; otherwise Axi uses `3000`.

## Health checks

Add a health endpoint so load balancers and uptime monitors can check your app:

```typescript
// app/api/health/route.ts
import { route } from "@axi-js/core";

export const healthCheck = route.get().handle(async () => {
  return { status: "ok", timestamp: Date.now() };
});
```

The health check is at `/api/health`; fall back to `/` if you don't define one.

## Configuration

- **Port**: Axi reads `PORT` from the environment first, then `axi.config.ts`, then defaults to `3000`. Set `PORT` in your `docker-compose.yml` or platform settings.
- **Environment variables**: pass them via `environment:` in Compose, `fly secrets set`, or your platform's dashboard. Never commit `.env` files.
- **Static assets**: anything in `public/` is served at the root (e.g. `public/robots.txt` → `/robots.txt`).

## Requirements

- Docker (locally or on the server) for the containerized flow
- [Bun](https://bun.sh) >= 1.3.14 for local development
