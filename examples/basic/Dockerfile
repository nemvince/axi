# syntax=docker/dockerfile:1
# Generated Dockerfile for Axi apps.
#
#   docker build -t my-app .
#   docker run -p 3000:3000 my-app
#
# Or use the included docker-compose.yml for a full setup with HTTPS.

# Stage 1: install dependencies and build production artifacts (.axi/)
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# .dockerignore keeps node_modules, .git, .env, etc. out of the build context.
COPY . .
RUN bun run build

# Stage 2: minimal runtime image
FROM oven/bun:1-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy the whole app: app/, components/, lib/, public/, tsconfig.json, and
# the prebuilt .axi/ artifacts all land in the image. The SSR server imports
# app source (e.g. @/components/*) at runtime, so every directory must ship.
COPY --from=build /app ./

EXPOSE 3000
CMD ["bun", "run", "start", "--hostname", "0.0.0.0"]
