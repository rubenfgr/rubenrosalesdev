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
- **Pruebas con Postgres real:** `src/db/repositories.test.ts` se salta sin `TEST_DATABASE_URL`. En local: `docker run -d --name rr-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=rr_test -p 55432:5432 postgres:17` y `TEST_DATABASE_URL=postgres://postgres:dev@localhost:55432/rr_test pnpm --filter @rr/api test`. En CI lo define un servicio `postgres` de `ci.yml`.
- **Una prueba:** `src/*.test.ts` con vitest. `createApp` recibe sus dependencias (`db`, `pingDb`), así que se prueba con `app.request(...)` sin red ni base de datos reales. `pnpm --filter @rr/api test`.

## Errores

Formato único: `{ "error": "<codigo_snake_case>", "message"?: string }`. Códigos: `invalid_request` (400), `not_found` (404), `rate_limited` (429), `internal` (500), `llm_unavailable` (503). Un cuerpo de más de 32 KB devuelve `413 payload_too_large`. El rate limit (`lib/rate-limit.ts`) usa el primer valor de `X-Forwarded-For` (Traefik) y devuelve `429 rate_limited` con `Retry-After`; es en memoria, válido con una sola instancia. Los logs nunca contienen cuerpos de petición, emails ni mensajes de usuarios.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | sí | Cadena de conexión a Postgres |
| `PORT` | no | Puerto (3000 por defecto) |
| `ALLOWED_ORIGIN` | no | Origen CORS; vacío = mismo origen (lo normal) |
| `IP_HASH_SALT` | cuando se guarde algo de la IP | Sal para hashear IPs; nunca se guardan en claro. Si falta, se genera una aleatoria en cada arranque (los hashes cambian al reiniciar) |
| `CONTACT_TO`, `GMAIL_SENDER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` | para enviar leads | Gmail API (OAuth2); misma configuración que la web (ver [formulario-contacto.md](formulario-contacto.md)). Sin ellas el lead se guarda y la API responde `502 mail_unavailable` |
| `CONVERSATION_RETENTION_DAYS` / `LEAD_RETENTION_DAYS` | no | Conservación: 90 días las conversaciones, 365 los leads (D-3) |
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

**Precios y privacidad (verificado el 2026-10-25 en la documentación oficial):** Gemini 3.5 Flash-Lite, nivel de pago, estándar: 0,30 USD por millón de tokens de entrada y 2,50 USD de salida (incluye los tokens de razonamiento). Google indica que en el nivel de pago el contenido **no** se usa para mejorar sus productos (en el gratuito sí). **En producción hay que usar el nivel de pago:** los términos de la Gemini API (ai.google.dev/gemini-api/terms) dicen que para clientes disponibles en el EEE, Suiza o el Reino Unido «solo se pueden usar los servicios de pago» (cuenta de facturación de Cloud activa). El nivel gratuito sirve solo para pruebas locales con datos sintéticos. La tabla está en dólares: se usan las mismas cifras como euros, lo que sobrestima el coste (lado seguro). Revísalo si cambia la tarifa.

**Prueba manual con clave real (local):** `ASSISTANT_LLM_ENABLED=1 ASSISTANT_LLM_API_KEY=<tu clave> ASSISTANT_LLM_MODEL=gemini-3.5-flash-lite pnpm dev:api` y `curl -N -X POST localhost:3000/api/v1/chat ...` (cuando exista T-3.6). La clave solo en tu shell, nunca en el repo.

En el VPS las pone `deploy/.env.example` → `.env` (ver [despliegue.md](despliegue.md)). Las demás variables (límites, LLM…) se documentan aquí al añadirlas.

## Chat del asistente (`POST /api/v1/chat`)

Entrada: `ChatRequest` de `@rr/shared` (idioma, hasta 20 mensajes y `consent`). Salida: `text/event-stream` con `delta` (`{text}`), `done` (`{conversationId, source: rule|cache|llm}`) y `error`. Si el LLM está apagado, sin clave o falla antes de dar texto: `503 {"error":"llm_unavailable"}` y la web degrada a reglas.

Orden de un turno (`services/chat.ts`), pensado para gastar lo mínimo:

1. **Reglas primero:** si `matchRule()` resuelve la pregunta (precio, plazo, quién es Rubén, contacto, cómo trabaja), responde con el guion de `assistant.json` sin llamar al LLM.
2. **Caché** (`answer_cache`, TTL 30 días): solo preguntas sueltas, sin email ni teléfono y sin importes en la respuesta. Se normaliza (minúsculas, sin tildes ni puntuación).
3. **Límites:** más de 12 mensajes del usuario en la conversación, 20 llamadas al LLM por IP y día (IP con hash y sal) y, más adelante, el tope mensual → `llm_unavailable` (la web sigue con reglas).
4. **LLM** con system prompt mínimo (reglas + bio + solo las secciones relevantes por palabras clave), últimos 6 mensajes recortados a 500 caracteres, `maxOutputTokens` 300 y temperatura 0,3. **El asistente no da precios**: los fija Rubén en cada propuesta; no hay tabla de precios en el repo ni en la web.
5. **Validador de cifras** (`services/validator.ts`): ningún importe en euros puede llegar al visitante (tampoco «cinco mil euros» ni «5k €»), ni fragmentos del system prompt. Si el modelo los produce, se sustituye la respuesta por `actions.fallback` (derivar a Rubén) y se avisa en el log sin contenido. Decisión de streaming: la respuesta del LLM se **bufferiza entera** (≤ 300 tokens), se valida y se emite después en frases; así nunca se envía un importe ni hay que retractar texto.

### Coste (objetivo ≤ 1 €/mes)

**Medido con Gemini 3.5 Flash-Lite real** (2026-10-26, 37 casos de `pnpm --filter @rr/api eval`, 27 llamadas al LLM): de media **512 tokens de entrada y 81 de salida** por llamada, es decir, unos **0,00036 USD** por llamada con la tarifa de pago (0,30/2,50 USD por millón). El tope de 1 € equivale a **unas 2.800 llamadas al mes**. Las preguntas resueltas por reglas o caché no cuestan nada, y la cuenta de ejemplo del tope está más abajo. Con conversaciones más largas (historial máximo de 6 mensajes) el coste por llamada puede duplicarse.

## Proveedor alternativo: Ollama (modelos open)

`ASSISTANT_LLM_PROVIDER=ollama`, `OLLAMA_BASE_URL` (por defecto `http://ollama:11434`) y `OLLAMA_MODEL`. Coste del proveedor: 0. API verificada en la documentación oficial (`POST /api/chat`, NDJSON). El cliente **no usa function calling**: la estimación se calcula en código a partir de `ctx` y se entrega al modelo como dato en el prompt. Sin `ctx` completo, el modelo no recibe cifras y el validador bloquea cualquiera que invente.

El servicio `ollama` del compose está bajo el profile `llm-local` (no arranca por defecto, sin puertos, con volumen `ollama`). Para usarlo: `docker compose --profile llm-local up -d ollama` y `docker exec rubenrosales-ollama ollama pull <modelo>`.

**Recursos del VPS (medidos el 2026-10-26 en `rr-core-prod-01`):** 2 vCPU Intel Xeon Skylake, 3,7 GiB de RAM (2,7 GiB disponibles con la web, la API y Postgres en marcha), sin swap, sin GPU, 27 GB de disco libres. **Conclusión: no activar Ollama en este VPS.** Un modelo pequeño multilingüe (1–3B cuantizado) necesita 1,5–3 GB de RAM sin contar el contexto; con 2,7 GiB libres y sin swap, el riesgo es que el sistema mate procesos (incluida la base de datos), y en 2 vCPU sin GPU la velocidad sería de unos pocos tokens por segundo (estimación, no medida: no se ha instalado nada en el servidor). Si algún día se cambia a un servidor con más RAM (≥ 8 GB), el cliente, la factoría y el servicio bajo el profile `llm-local` ya están listos; entonces habría que elegir el modelo con los evals (`pnpm --filter @rr/api eval`, con `ASSISTANT_LLM_PROVIDER=ollama`). Mientras tanto, la degradación al llegar al 80 % del tope es la de siempre: solo reglas.

## Persistencia y leads

- **Conversaciones:** solo se guardan si la petición lleva `consent: true` (D-3). Sin consentimiento no se escribe nada. Se identifican por un UUID aleatorio y un hash con sal de la IP; caducan a los 90 días.
- **Leads (`POST /api/v1/leads`):** valida con `leadSchema`, antispam (señuelo `website` y tiempo mínimo de 3 s desde `startedAt`), guarda el lead (caduca a los 12 meses) y envía el email a Rubén con `Reply-To` del visitante. Límite: `RATE_LIMIT_LEADS_PER_HOUR` por IP.
- **Contacto (`POST /api/v1/contact`):** mismo antispam y límite que los leads; no se guarda, solo se envía el email (formato en `services/contact-email.ts`, con las etiquetas en español que `scripts/export-knowledge.mjs` toma de la web).
- **Borrado:** `jobs/purge.ts` borra al arrancar y una vez al día lo caducado. Al borrar una conversación caen sus mensajes (`ON DELETE CASCADE`); los leads se purgan por su propia fecha y su `conversation_id` pasa a nulo. Solo se registran recuentos.

## Tope de gasto del LLM (1 €/mes) y kill switch

- Cada respuesta de Gemini devuelve sus tokens; `services/budget.ts` calcula el coste con `ASSISTANT_LLM_PRICE_IN/OUT_PER_MTOK` y lo acumula en memoria y en la tabla `llm_usage_monthly` (clave `YYYY-MM` + proveedor; el mes se reinicia solo y el contador se sincroniza al arrancar).
- **Degradación en cadena** (`services/llm-router.ts`): hasta el 80 % del tope, Gemini. Entre el 80 % y el 100 %, Ollama si está configurado; si no, `503 llm_unavailable` y la web sigue con reglas (que no cuestan nada). Al 100 % no se llama a Gemini bajo ningún concepto. Lo que gasta Ollama no cuenta.
- **Seguridad:** si faltan los precios, Gemini queda desactivado (con precio 0 el tope nunca saltaría).
- **Kill switch:** `ASSISTANT_LLM_ENABLED` distinto de `1` y `docker compose up -d api` (o `restart api`) apaga el LLM.
- **Ver el gasto del mes** (solo lectura, no hay endpoint público): `docker exec rubenrosales-api node dist/jobs/usage.js`.
- Cuenta de ejemplo (usada en las pruebas): 1.000.000 de tokens de entrada × 0,30 + 200.000 de salida × 2,50, por millón = 0,30 + 0,50 = **0,80 €**, el 80 % del tope.
- La alerta de presupuesto de Google en 1 € es una segunda red de seguridad: avisa, no corta.
