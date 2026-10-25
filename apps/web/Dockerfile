# Imagen de producción de la web (Astro con adaptador Node, modo standalone).
# Contexto de build: la raíz del monorepo.
#   docker build -f apps/web/Dockerfile -t rubenrosales-web --build-arg GUARDS_STRICT=1 .
FROM node:24-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN npm install -g pnpm@12.12.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

FROM base AS build
RUN pnpm install --frozen-lockfile --filter @rr/web...
COPY packages/shared packages/shared
COPY apps/web apps/web
# Con GUARDS_STRICT=1 el build falla si queda algún [VERIFICAR] o un borrador enlazado.
ARG GUARDS_STRICT=0
ARG PUBLIC_ASSISTANT_ENABLED=
ARG PUBLIC_ASSISTANT_LLM=
ARG PUBLIC_CF_ANALYTICS_TOKEN=
ENV GUARDS_STRICT=$GUARDS_STRICT PUBLIC_ASSISTANT_ENABLED=$PUBLIC_ASSISTANT_ENABLED PUBLIC_ASSISTANT_LLM=$PUBLIC_ASSISTANT_LLM PUBLIC_CF_ANALYTICS_TOKEN=$PUBLIC_CF_ANALYTICS_TOKEN
RUN pnpm --filter @rr/web build

FROM base AS deps
RUN pnpm install --prod --frozen-lockfile --filter @rr/web...

FROM node:24-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY apps/web/package.json ./apps/web/
WORKDIR /app/apps/web
USER node
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:4321/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server/entry.mjs"]
