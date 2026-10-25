# Despliegue en el VPS

El proyecto es un monorepo pnpm con tres piezas desplegadas en el VPS con Docker Compose, detrás de Traefik:

```
Traefik ─┬─ rubenrosales.dev                  → web      (Astro + @astrojs/node, :4321, apps/web)
         └─ rubenrosales.dev + /api/v1        → api      (Hono sobre Node, :3000, apps/api)
                                                  │
                                                  └─ postgres (red interna, sin puertos expuestos, volumen pgdata)
```

La web sirve las páginas estáticas, `/api/contact` y las redirecciones 301 del portal anterior. La API cuelga del mismo dominio bajo `/api/v1` (sin DNS ni CORS nuevos); ver [backend.md](backend.md). Las copias de seguridad de Postgres se añaden en la fase 8 del plan (`.plan/plans/asistente-llm-backend.md`).

**`main` = producción.** Cada push a `main` construye las imágenes y las despliega (`.github/workflows/deploy.yml`). Las demás ramas solo pasan por `ci.yml` (tipos + build). Trabaja en ramas y no hagas push ni merge a `main` sin aprobación de Rubén.

## Flujo

1. Push a `main` → GitHub Actions construye la imagen de la web con `GUARDS_STRICT=1` (si queda un `[VERIFICAR]` o un borrador enlazado, el build falla y **no se despliega nada**).
2. Construye también la imagen de la API y publica `ghcr.io/rubenfgr/rubenrosalesdev-web` y `ghcr.io/rubenfgr/rubenrosalesdev-api` (`latest` y el SHA del commit).
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
3. Acceso a la imagen: o haces público el paquete en GitHub (Packages → rubenrosalesdev-web y rubenrosalesdev-api → Package settings → Change visibility), o inicias sesión en el VPS con un token de solo lectura de paquetes: `docker login ghcr.io -u rubenfgr`.
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

Ver `deploy/.env.example`: base de datos (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL` coherente con ellos, `ALLOWED_ORIGIN` vacío), proveedor de email (`CONTACT_PROVIDER` = `gmail` o `resend`, `CONTACT_TO`, credenciales) y, si se activa, el LLM del asistente. Detalles en [formulario-contacto.md](formulario-contacto.md). Tras editar el `.env`: `cd /opt/apps/projects/rubenrosalesdev && docker compose up -d`.

## Operación

- Logs: `docker logs -f rubenrosales-web`, `rubenrosales-api` o `rubenrosales-postgres`. Estado: `docker compose ps`.
- La API aplica las migraciones al arrancar. Postgres no expone puertos: para entrar, `docker exec -it rubenrosales-postgres psql -U <usuario> <base>`.
- Restaurar una copia de seguridad: se documentará en `docs/restaurar-backup.md` (fase 8).
- Volver a una versión anterior: cambiar `latest` por un SHA en `compose.yml` y `docker compose up -d`. Las migraciones son aditivas, no hay que deshacer la base de datos.
- Probar las imágenes en local (contexto = raíz del repo): `docker build -f apps/web/Dockerfile -t rr-web . && docker run --rm -p 4321:4321 rr-web` y `docker build -f apps/api/Dockerfile -t rr-api .`.
- Local con Tailscale: `pnpm dev:tailscale`.

## Antes de que llegue a producción

El deploy falla a propósito mientras queden `[VERIFICAR]` en las páginas (cifras del hero, proveedor del VPS en `/privacidad`…). Resuélvelos o decide qué publicar antes de hacer push a `main`.

Las redirecciones del portal anterior se generan en el build (`apps/web/scripts/generate-redirects.mjs`) y se aplican en la ruta comodín `apps/web/src/pages/[...path].ts`; ver [redirecciones.md](redirecciones.md).
