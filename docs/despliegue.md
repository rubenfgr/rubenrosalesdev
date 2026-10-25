# Despliegue en el VPS

La web es un servidor Node (Astro con `@astrojs/node`, modo standalone) en un contenedor Docker, detrás de Traefik. Sirve las páginas estáticas, las rutas `/api/*` y las redirecciones 301 del portal anterior.

**`main` = producción.** Cada push a `main` construye la imagen y la despliega (`.github/workflows/deploy.yml`). Las demás ramas solo pasan por `ci.yml` (tipos + build). Trabaja en ramas y no hagas push ni merge a `main` sin aprobación de Rubén.

## Flujo

1. Push a `main` → GitHub Actions construye la imagen con `GUARDS_STRICT=1` (si queda un `[VERIFICAR]` o un borrador enlazado, el build falla y **no se despliega nada**).
2. Publica `ghcr.io/rubenfgr/rubenrosalesdev-web` (`latest` y el SHA del commit).
3. Copia `deploy/compose.yml` al VPS (`/opt/apps/projects/rubenrosalesdev/`) y ejecuta `docker compose pull && docker compose up -d`.
4. Traefik enruta `rubenrosales.dev` (y redirige `www` y HTTP a `https://rubenrosales.dev`) con el certificado de Let's Encrypt.

## Preparar el VPS (una sola vez)

1. Directorio y variables:
   ```bash
   sudo mkdir -p /opt/apps/projects/rubenrosalesdev && sudo chown $USER /opt/apps/projects/rubenrosalesdev
   cp deploy/.env.example /opt/apps/projects/rubenrosalesdev/.env   # y rellenar (ver más abajo)
   chmod 600 /opt/apps/projects/rubenrosalesdev/.env
   ```
2. La red `proxy` de Traefik ya existe (externa). El contenedor se une a ella.
3. Acceso a la imagen: o haces público el paquete en GitHub (Packages → rubenrosalesdev-web → Package settings → Change visibility), o inicias sesión en el VPS con un token de solo lectura de paquetes: `docker login ghcr.io -u rubenfgr`.
4. Una clave SSH solo para desplegar (sin contraseña) cuyo usuario pueda ejecutar `docker compose`. La pública va en `~/.ssh/authorized_keys` del VPS.

## Secretos y variables de GitHub (Settings → Secrets and variables → Actions)

| Tipo | Nombre | Para qué |
|---|---|---|
| Secreto | `VPS_HOST` | IP o dominio del VPS |
| Secreto | `VPS_USER` | Usuario SSH de despliegue |
| Secreto | `VPS_SSH_KEY` | Clave privada del despliegue |
| Secreto | `VPS_KNOWN_HOSTS` | Salida de `ssh-keyscan -p <puerto> <host>` (evita aceptar claves de host a ciegas) |
| Secreto (opcional) | `VPS_PORT` | Puerto SSH si no es el 22 |
| Variable (opcional) | `PUBLIC_ASSISTANT_ENABLED` | `1` muestra el asistente (ver [asistente.md](asistente.md)) |
| Variable (opcional) | `PUBLIC_CF_ANALYTICS_TOKEN` | Token de Cloudflare Web Analytics (solo si se usa; antes, actualizar `/cookies`) |

## Variables del servidor (`/opt/apps/projects/rubenrosalesdev/.env`, nunca en el repo)

Ver `deploy/.env.example`: proveedor de email (`CONTACT_PROVIDER` = `gmail` o `resend`, `CONTACT_TO`, credenciales) y, si se activa, el LLM del asistente. Detalles en [formulario-contacto.md](formulario-contacto.md). Tras editar el `.env`: `cd /opt/apps/projects/rubenrosalesdev && docker compose up -d`.

## Operación

- Logs: `docker logs -f rubenrosales-web`.
- Volver a una versión anterior: cambiar `latest` por un SHA en `compose.yml` y `docker compose up -d`.
- Probar la imagen en local: `docker build -t rr-web . && docker run --rm -p 4321:4321 rr-web`.
- Local con Tailscale: `pnpm dev:tailscale`.

## Antes de que llegue a producción

El deploy falla a propósito mientras queden `[VERIFICAR]` en las páginas (cifras del hero, proveedor del VPS en `/privacidad`…). Resuélvelos o decide qué publicar antes de hacer push a `main`.

Las redirecciones del portal anterior se generan en el build (`scripts/generate-redirects.mjs`) y se aplican en la ruta comodín `src/pages/[...path].ts`; ver [redirecciones.md](redirecciones.md).
