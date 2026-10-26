#!/usr/bin/env bash
# Levanta (o reutiliza) el Postgres local de desarrollo y aplica las migraciones. Uso: pnpm dev:db
set -euo pipefail
if docker ps -a --format '{{.Names}}' | grep -qx rr-pg; then
  docker start rr-pg >/dev/null
else
  docker run -d --name rr-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=rr -p 55432:5432 postgres:17 >/dev/null
fi
for _ in $(seq 1 30); do docker exec rr-pg pg_isready -U postgres -d rr >/dev/null 2>&1 && break; sleep 1; done
sleep 1
pnpm --filter @rr/api db:migrate
echo "Postgres listo en localhost:55432 (usuario postgres, contraseña dev, base rr)."
