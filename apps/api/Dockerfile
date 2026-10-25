# Imagen de la API (Hono sobre Node). Contexto de build: la raíz del monorepo.
#   docker build -f apps/api/Dockerfile -t rubenrosales-api .
FROM node:24-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN npm install -g pnpm@12.12.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

FROM base AS build
RUN pnpm install --frozen-lockfile --filter @rr/api...
COPY packages/shared packages/shared
COPY apps/api apps/api
# Contenido de la web: scripts/export-knowledge.mjs lo empaqueta en el build de la API.
COPY scripts/export-knowledge.mjs scripts/export-knowledge.mjs
COPY apps/web/src/content apps/web/src/content
COPY apps/web/src/i18n/ui/es.json apps/web/src/i18n/ui/es.json
RUN pnpm --filter @rr/api build

# tsup empaqueta todo: la imagen final solo lleva el resultado y las migraciones SQL.
FROM node:24-slim AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/drizzle ./drizzle
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]
