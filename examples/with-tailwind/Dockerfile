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

COPY . .
# public/ and axi.config.ts are optional; ensure they exist so the
# runtime stage can copy them unconditionally.
RUN mkdir -p public \
  && test -f axi.config.ts || printf 'export default {};\n' > axi.config.ts \
  && bun run build

# Stage 2: production dependencies only
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --production --frozen-lockfile

# Stage 3: minimal runtime image
FROM oven/bun:1-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.axi ./.axi
COPY --from=build /app/app ./app
COPY --from=build /app/public ./public
COPY --from=build /app/axi.config.ts ./axi.config.ts

EXPOSE 3000
CMD ["bun", "run", "start", "--hostname", "0.0.0.0"]
