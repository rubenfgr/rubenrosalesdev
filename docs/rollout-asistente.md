# Rollout del asistente (guion para Rubén)

Nada de esto se ha ejecutado. `main` = producción: cada paso que toque `main` o el VPS lo decide y lo lanza Rubén.

## 0. Antes de empezar (lista de comprobación)

- [ ] **Cifras reales** en `apps/web/src/content/assistant/pricing.json` y `placeholder` a `false` (decisión D-1). Con `placeholder: true` el build estricto falla.
- [ ] **Textos legales** revisados: los dos `[VERIFICAR: revisión legal]` de la sección 10 de `/privacidad` resueltos. Comprobación: `GUARDS_STRICT=1 pnpm --filter @rr/web build` sin problemas.
- [ ] **`.env` del VPS** (`/opt/apps/projects/rubenrosalesdev/.env`, permisos 600), a partir de `deploy/.env.example`:
  - Postgres: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (larga y aleatoria) y `DATABASE_URL` coherente.
  - `IP_HASH_SALT` (larga y aleatoria; con ella los hashes sobreviven a reinicios).
  - Gmail: las variables que ya usa la web (`CONTACT_TO`, `GMAIL_*`); la API las lee del mismo fichero.
  - LLM (puede esperar al paso 3): `ASSISTANT_LLM_API_KEY`, `ASSISTANT_LLM_MODEL=gemini-3.5-flash-lite`, `ASSISTANT_LLM_PRICE_IN_PER_MTOK=0.30`, `ASSISTANT_LLM_PRICE_OUT_PER_MTOK=2.50`, `ASSISTANT_LLM_MONTHLY_BUDGET_EUR=1`. **Sin los precios, Gemini no se activa.**
- [ ] **Google:** alerta de presupuesto en 1 € y saldo cargado.
- [ ] **Paquetes de GHCR:** `rubenrosalesdev-api` accesible para el VPS (público o `docker login`; ver `docs/despliegue.md`).
- [ ] **Copias de seguridad:** sin copia externa por decisión D-6 (solo las nocturnas en el VPS; ver riesgo en `docs/restaurar-backup.md`). Restauración ya probada en local.
- [ ] **Evals y red team:** `pnpm --filter @rr/api eval --out .plan/evidence/evals-1.md` sin fallos graves y la lista manual de `.plan/evidence/red-team.md` pasada con el modelo real.
- [ ] `pnpm check`, `pnpm test`, `pnpm build`, `pnpm e2e` y las dos imágenes Docker en verde.

## 1. Desplegar la infraestructura sin activar el asistente (T-10.2)

1. Merge de `feat/backend-monorepo` a `main` (dispara `deploy.yml`). Antes, repasa el diff con `git diff main...feat/backend-monorepo --stat`.
2. En GitHub, variables `PUBLIC_ASSISTANT_ENABLED` y `PUBLIC_ASSISTANT_LLM` **vacías** (o inexistentes).
3. Comprueba en producción:
   - La web se ve igual que antes y el formulario de contacto sigue funcionando (ahora va a `/api/v1/contact`: envía un mensaje de prueba y comprueba que llega el email).
   - `curl -s https://rubenrosales.dev/api/v1/health` → `{"status":"ok"}`.
   - En el VPS: `docker compose ps` con `api`, `postgres` y `web` en `healthy` (y `backup` arrancado); `docker logs rubenrosales-backup` con «backup ok».
   - `docker exec rubenrosales-postgres pg_isready` y que no haya puertos publicados.
   - Que el límite por IP funciona con la IP real: es la primera comprobación pendiente de Traefik (`X-Forwarded-For`). Prueba: 11 peticiones seguidas a `/api/v1/chat` desde tu IP deben dar un 429 al final y no afectar a otra IP.
4. **Vuelta atrás:** en `compose.yml` del VPS, cambia `latest` por la etiqueta (SHA) anterior de cada imagen y `docker compose up -d`. La base de datos es aditiva: no hay migraciones destructivas.

## 2. Activar el asistente solo con reglas (T-10.3, paso 1)

1. Variable de GitHub `PUBLIC_ASSISTANT_ENABLED=1`, `PUBLIC_ASSISTANT_LLM` vacía; vuelve a desplegar (`workflow_dispatch`).
2. Prueba tú, en es y en: aviso de consentimiento, flujo guiado, estimación y envío del resumen. Debe llegar el email (`Asistente web: <nombre>`) y quedar una fila en `leads`:
   `docker exec rubenrosales-postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" -c "select name, email, created_at from leads order by created_at desc limit 3"`.
3. Observa unos días: `docker logs --tail 100 rubenrosales-api` (sin contenido de usuarios; solo método, ruta, estado, id).

## 3. Activar el LLM (T-10.3, paso 2)

1. `ASSISTANT_LLM_ENABLED=1` y la clave en el `.env` del VPS; `docker compose up -d api`.
2. Variable de GitHub `PUBLIC_ASSISTANT_LLM=1` y nuevo despliegue.
3. Observa 48 h: errores en logs, `docker exec rubenrosales-api node dist/jobs/usage.js` (gasto del mes) y las respuestas bloqueadas por el validador (`respuesta bloqueada por el validador de cifras` en los logs).
4. **Kill switch:** deja `ASSISTANT_LLM_ENABLED` vacío en el `.env` y `docker compose up -d api`. La web sigue con reglas. Para ocultar el asistente entero, `PUBLIC_ASSISTANT_ENABLED` vacío y volver a desplegar.

## Qué pasa si…

- **Se agota el tope (80 %):** la API usa Ollama si está configurado; si no, responde 503 al chat y la web usa reglas. Al 100 % no se llama a Gemini.
- **Falla el email:** el lead queda guardado y el visitante ve el aviso de error con el correo de contacto; busca el lead en la tabla.
- **Una persona pide borrar sus datos:** `docs/privacidad-operativa.md`.
