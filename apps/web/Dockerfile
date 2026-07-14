# Build context is the repo root (pnpm workspace) — see docker-compose.yml.
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /repo

# Copy only manifests first so this layer is cached until dependencies change.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

COPY . .

WORKDIR /repo/apps/web
EXPOSE 5173
CMD ["pnpm", "dev"]
