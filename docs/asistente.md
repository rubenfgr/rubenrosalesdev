# Asistente

Chatbot flotante (`apps/web/src/components/islands/Assistant.tsx`, isla `client:idle` montada en el layout).

**Estado: oculto.** El asistente no se muestra hasta definir la variable de build `PUBLIC_ASSISTANT_ENABLED=1`. Sin ella, el layout no lo monta ni descarga su código. En producción es la variable de GitHub `PUBLIC_ASSISTANT_ENABLED` (se aplica en el build de la imagen).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Guiones, ramas, opciones, avisos, bio, textos de las tarjetas | `apps/web/src/content/assistant/{es,en}.json` |
| Tabla de rangos y multiplicadores (sin idioma) | `apps/web/src/content/assistant/pricing.json` |
| Motor de reglas (estimación, reglas de texto libre) | `packages/shared/src/assistant/engine.ts` |
| System prompt del LLM | `apps/api/src/services/prompt.ts` (se construye con los mismos datos, empaquetados en el build de la API) |
| Ruta del LLM (desactivada por defecto) | `POST /api/v1/chat` en `apps/api` (fase 3 del plan) |
| Envío del resumen | `POST /api/v1/leads` (API); el formulario de contacto sigue en `POST /api/contact` |
| Aviso de privacidad y consentimiento | `consent` en `apps/web/src/content/assistant/{es,en}.json` |
| Cliente de la API en la web | `apps/web/src/lib/assistant/api.ts` |

## Cifras de ejemplo

Todas las cifras de `pricing.json` llevan `"placeholder": true`. Mientras exista alguno, `GUARDS_STRICT=1` hace fallar el build. Confírmalas con Rubén, cambia a `false` y vuelve a construir.

## LLM (opcional)

Activar con `ASSISTANT_LLM_ENABLED=1`, `ASSISTANT_LLM_API_KEY` y `ASSISTANT_LLM_MODEL` (en el `.env` del servidor). La isla sigue usando el motor de reglas; para pasar al LLM hay que llamar a `/api/assistant` desde la isla (pendiente: decisión de producto). Reglas del prompt: nunca cifras fuera de `pricing.json` ni antes de tener tipo, herramientas y equipo; siempre rango + confianza + «no es un presupuesto»; si no sabe, derivar a Rubén; responder en el idioma de la página.

## Flags de build de la web

- `PUBLIC_ASSISTANT_ENABLED=1`: muestra el asistente (flujo guiado por reglas; el resumen va a `/api/v1/leads`, así que la API debe estar desplegada).
- `PUBLIC_ASSISTANT_LLM=1`: además, el texto libre va a `POST /api/v1/chat` con streaming; si la API responde 503, hay un límite o falla la red, el asistente usa el motor de reglas. Con ambos vacíos el HTML no contiene el asistente.

## Pruebas

- `pnpm test`: unitarias e integración (motor, prompt, validador, rutas, cliente de la web). Las de repositorios usan Postgres real si hay `TEST_DATABASE_URL` (ver [backend.md](backend.md)).
- `pnpm e2e`: prueba de humo con Playwright. Construye la web con el asistente activado, levanta web + API (LLM, email y base de datos simulados) detrás de un proxy local y recorre: aviso de consentimiento, texto libre con streaming, flujo guiado hasta la estimación y envío del resumen, a 1280 y 390 px. Comprueba que se guardan los leads y la conversación y que se «envía» el email. Necesita Chrome (`CHROME_PATH`, por defecto `/usr/bin/google-chrome`). No toca servidores reales ni deja la web construida con el flag distinto al que tenías: vuelve a ejecutar tu `pnpm build` normal después.
- `pnpm --filter @rr/api eval`: 39 casos (es y en) contra el LLM real; solo con `ASSISTANT_LLM_API_KEY` y `ASSISTANT_LLM_MODEL` en el entorno. No corre en CI. Opción `--out informe.md`.
