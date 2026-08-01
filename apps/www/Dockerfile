# syntax=docker/dockerfile:1
# Build the Axi marketing/docs site (apps/www) within the monorepo.
#
# The www app depends on the framework via `workspace:*` and uses `catalog:`
# version refs from the root package.json, so the build runs from the monorepo
# root and installs the whole workspace:
#
#   docker build -f apps/www/Dockerfile -t axi-www .
#
# Every workspace manifest is copied up front so `bun install --frozen-lockfile`
# matches the lockfile and hoists peer deps (react, react-dom) into
# packages/axi/node_modules — exactly how the repo resolves locally.

# Stage 1: install workspace deps + build production artifacts
FROM oven/bun:1 AS build
WORKDIR /repo

COPY package.json bun.lock* ./
COPY packages/axi/package.json packages/axi/package.json
COPY packages/create-axi/package.json packages/create-axi/package.json
COPY apps/www/package.json apps/www/package.json
COPY examples/basic/package.json examples/basic/package.json
COPY examples/with-tailwind/package.json examples/with-tailwind/package.json
RUN bun install --frozen-lockfile

# Framework + app sources
COPY packages/axi packages/axi
COPY apps/www apps/www
# Re-install so the `axi` bin link (created from the now-present sources) exists
RUN bun install --frozen-lockfile && cd apps/www && bun run build

# Stage 2: production dependencies only
FROM oven/bun:1 AS deps
WORKDIR /repo
COPY package.json bun.lock* ./
COPY packages/axi/package.json packages/axi/package.json
COPY packages/create-axi/package.json packages/create-axi/package.json
COPY apps/www/package.json apps/www/package.json
COPY examples/basic/package.json examples/basic/package.json
COPY examples/with-tailwind/package.json examples/with-tailwind/package.json
RUN bun install --production --frozen-lockfile
COPY packages/axi packages/axi
COPY apps/www apps/www

# Stage 3: minimal runtime image. The workspace layout is preserved so the
# @axi-js/core symlink and peer deps keep resolving at runtime.
FROM oven/bun:1-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=deps /repo/apps/www ./apps/www
COPY --from=deps /repo/packages/axi ./packages/axi
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/apps/www/.axi ./apps/www/.axi

WORKDIR /repo/apps/www
EXPOSE 3000
# Invoke the CLI directly through the @axi-js/core workspace symlink: the
# `axi` bin link is only created when sources exist at install time, so it
# can't be relied on in the image. Bind 0.0.0.0 so the published port works.
CMD ["bun", "./node_modules/@axi-js/core/bin/cli.ts", "start", "--hostname", "0.0.0.0"]
