FROM oven/bun:1-slim AS base
WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --production

COPY . .

USER bun
ENTRYPOINT [ "bun", "run", "index.ts" ]