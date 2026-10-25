# Asistente

Chatbot flotante (`src/components/islands/Assistant.tsx`, isla `client:idle` montada en el layout).

**Estado: oculto.** El asistente no se muestra hasta definir la variable de build `PUBLIC_ASSISTANT_ENABLED=1`. Sin ella, el layout no lo monta ni descarga su código. En producción es la variable de GitHub `PUBLIC_ASSISTANT_ENABLED` (se aplica en el build de la imagen).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Guiones, ramas, opciones, avisos, bio, textos de las tarjetas | `src/content/assistant/{es,en}.json` |
| Tabla de rangos y multiplicadores (sin idioma) | `src/content/assistant/pricing.json` |
| Motor de reglas (estimación, reglas de texto libre) | `src/lib/assistant/engine.ts` |
| System prompt del LLM | `src/lib/assistant/prompt.ts` (se construye con los mismos datos) |
| Ruta del LLM (desactivada por defecto) | `src/pages/api/assistant.ts` |
| Envío del resumen | `POST /api/contact` con `kind: "assistant"` |

## Cifras de ejemplo

Todas las cifras de `pricing.json` llevan `"placeholder": true`. Mientras exista alguno, `GUARDS_STRICT=1` hace fallar el build. Confírmalas con Rubén, cambia a `false` y vuelve a construir.

## LLM (opcional)

Activar con `ASSISTANT_LLM_ENABLED=1`, `ASSISTANT_LLM_API_KEY` y `ASSISTANT_LLM_MODEL` (en el `.env` del servidor). La isla sigue usando el motor de reglas; para pasar al LLM hay que llamar a `/api/assistant` desde la isla (pendiente: decisión de producto). Reglas del prompt: nunca cifras fuera de `pricing.json` ni antes de tener tipo, herramientas y equipo; siempre rango + confianza + «no es un presupuesto»; si no sabe, derivar a Rubén; responder en el idioma de la página.
