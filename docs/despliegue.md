# Despliegue en Cloudflare Workers

La web es estática, con un único endpoint de servidor (`/api/contacto`). Se despliega como Worker con *static assets* mediante `@astrojs/cloudflare`.

## Conectar el repositorio (Workers Builds)

En el panel de Cloudflare: Workers & Pages → Create → importar el repositorio de GitHub `rubenfgr/rubenrosalesdev`.

- **Rama de producción:** `main` (cada push construye y despliega).
- **Comando de build:** `pnpm build`
- **Comando de despliegue:** `npx wrangler deploy`
- Las ramas distintas de `main` generan una URL de *preview*.

> Los nombres exactos de los campos pueden cambiar en el panel; compruébalos al crearlo.

## Variables y secretos

| Dónde | Nombre | Para qué |
|---|---|---|
| Variable de build | `PUBLIC_CF_ANALYTICS_TOKEN` | Token de Cloudflare Web Analytics (si no existe, no se carga el script) |
| Variable de build | `GUARDS_STRICT=1` | Activar **solo al lanzar**: hace que el build falle si queda algún `[VERIFICAR`, un resultado sin verificar o un borrador enlazado. Equivale a usar `pnpm build:prod`. |
| Secretos del Worker | `GMAIL_*`, `CONTACT_TO` | Ver [formulario-contacto.md](formulario-contacto.md) |

## Antes del lanzamiento

Hasta que el dominio apunte aquí, trabajar en `main` es seguro: el despliegue va a una URL `*.workers.dev`. **No conectes `rubenrosales.dev` sin aprobación** (ver `CLAUDE.md`).
