# Backend (`apps/api`)

API en TypeScript con Hono sobre Node, Drizzle y Postgres. Cuelga del mismo dominio que la web bajo `/api/v1` (Traefik enruta por prefijo). Los contratos de entrada y salida (Zod) viven en `packages/shared`.

## Estructura

```
apps/api/
  src/index.ts        arranque y cierre ordenado
  src/app.ts          createApp({ env, db, pingDb }): rutas, middlewares y errores
  src/env.ts          validación del entorno con Zod (loadEnv)
  src/db/             schema.ts (tablas), index.ts (conexión), migrate.ts (aplica ./drizzle al arrancar)
  drizzle/            migraciones SQL generadas
  Dockerfile          contexto de build = raíz del repo; la imagen no lleva node_modules (tsup lo empaqueta todo)
packages/shared/      esquemas Zod compartidos con la web
```

## Levantar todo en local

```bash
pnpm install
docker run -d --name rr-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=rr -p 55432:5432 postgres:17
export DATABASE_URL=postgres://postgres:dev@localhost:55432/rr
pnpm --filter @rr/api db:migrate
pnpm dev:api        # API en http://localhost:3000/api/v1/health
pnpm dev            # web en http://localhost:4321
```

## Cómo añadir…

- **Una ruta:** crea la ruta en `app.ts` (o, desde la fase 2, un fichero en `src/routes/`), valida la entrada con un esquema de `@rr/shared` y devuelve errores con el formato de abajo.
- **Una migración:** edita `src/db/schema.ts`, ejecuta `pnpm --filter @rr/api db:generate`, **revisa el SQL** generado en `drizzle/` y aplícalo con `pnpm --filter @rr/api db:migrate`. Las migraciones deben ser aditivas (la vuelta atrás a una imagen anterior no deshace la base de datos).
- **Una prueba:** `src/*.test.ts` con vitest. `createApp` recibe sus dependencias (`db`, `pingDb`), así que se prueba con `app.request(...)` sin red ni base de datos reales. `pnpm --filter @rr/api test`.

## Errores

Formato único: `{ "error": "<codigo_snake_case>", "message"?: string }`. Códigos: `invalid_request` (400), `not_found` (404), `rate_limited` (429), `internal` (500), `llm_unavailable` (503). Un cuerpo de más de 32 KB devuelve `413 payload_too_large`. El rate limit (`lib/rate-limit.ts`) usa el primer valor de `X-Forwarded-For` (Traefik) y devuelve `429 rate_limited` con `Retry-After`; es en memoria, válido con una sola instancia. Los logs nunca contienen cuerpos de petición, emails ni mensajes de usuarios.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | sí | Cadena de conexión a Postgres |
| `PORT` | no | Puerto (3000 por defecto) |
| `ALLOWED_ORIGIN` | no | Origen CORS; vacío = mismo origen (lo normal) |
| `IP_HASH_SALT` | cuando se guarde algo de la IP | Sal para hashear IPs; nunca se guardan en claro |
| `RATE_LIMIT_CHAT_PER_MIN` | no | Peticiones de chat por IP y minuto (10) |
| `RATE_LIMIT_LEADS_PER_HOUR` | no | Envíos de lead por IP y hora (5) |

| `ASSISTANT_LLM_ENABLED` | no | `1` activa el LLM (kill switch: cualquier otro valor lo apaga al reiniciar) |
| `ASSISTANT_LLM_PROVIDER` | no | `gemini` (por defecto) u `ollama` |
| `ASSISTANT_LLM_API_KEY` | con Gemini | Clave de la Gemini API. Solo en el `.env` del VPS |
| `ASSISTANT_LLM_MODEL` | con Gemini | Valor inicial `gemini-3.5-flash-lite` |
| `ASSISTANT_LLM_MAX_OUTPUT_TOKENS` | no | Tope de salida por respuesta (300) |
| `ASSISTANT_LLM_MONTHLY_BUDGET_EUR` | no | Tope mensual (1) |
| `ASSISTANT_LLM_PRICE_IN_PER_MTOK` / `_OUT_PER_MTOK` | para el control de coste | Precio por millón de tokens (ver nota) |
| `OLLAMA_BASE_URL`, `OLLAMA_MODEL` | con Ollama | Proveedor alternativo |

**Precios y privacidad (verificado el 2026-10-25 en la documentación oficial):** Gemini 3.5 Flash-Lite, nivel de pago, estándar: 0,30 USD por millón de tokens de entrada y 2,50 USD de salida (incluye los tokens de razonamiento). Google indica que en el nivel de pago el contenido **no** se usa para mejorar sus productos (en el gratuito sí). La tabla está en dólares: se usan las mismas cifras como euros, lo que sobrestima el coste (lado seguro). Revísalo si cambia la tarifa.

**Prueba manual con clave real (local):** `ASSISTANT_LLM_ENABLED=1 ASSISTANT_LLM_API_KEY=<tu clave> ASSISTANT_LLM_MODEL=gemini-3.5-flash-lite pnpm dev:api` y `curl -N -X POST localhost:3000/api/v1/chat ...` (cuando exista T-3.6). La clave solo en tu shell, nunca en el repo.

En el VPS las pone `deploy/.env.example` → `.env` (ver [despliegue.md](despliegue.md)). Las demás variables (límites, LLM…) se documentan aquí al añadirlas.
