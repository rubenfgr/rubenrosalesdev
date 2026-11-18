---
kind: behavior
---

# Redirecciones

Las URLs del portal anterior siguen funcionando mediante redirecciones 301. La tabla completa está en [la referencia generada](reference/redirecciones.md).

### web.redirecciones-301 — Las URLs del portal anterior se redirigen con 301

Los orígenes del portal anterior (`/es/...`, `/en/...`, páginas sueltas) responden 301 al destino actual; lo que no tiene regla muestra la 404 del sitio.

- El origen de las reglas es `apps/web/src/data/legacy.json` (prefijos, slugs de blog, proyectos, páginas y `landingRedirects`).
- `apps/web/scripts/generate-redirects.mjs` las expande en `apps/web/src/data/redirects.generated.json` durante `pnpm build` (las exactas primero, las de comodín al final, y `/es/*` → `/:splat`).
- La ruta comodín `apps/web/src/pages/[...path].ts` (no prerenderizada) consulta `legacyTarget` y responde `301` conservando la query; si no hay regla, devuelve la 404 estática.
- `/en` es una ruta real del sitio (i18n): solo se redirige el prefijo `/es` heredado.
- Si cambia una URL del sitio, se añade su redirección en `legacy.json` (ver [[web.seo-imagenes-enlaces]]).

Why: la ruta comodín solo recibe lo que no coincide con ninguna página, así que las redirecciones no compiten con el contenido real.

#### Scenario: URL antigua sin regla
- WHEN llega una URL que no es una página ni tiene regla en la tabla
- THEN la respuesta es la 404 del sitio con código 404

### web.redirecciones-destino — El destino depende del contenido publicado

Un artículo o proyecto antiguo va a su URL nueva solo si sigue publicado; si no, a `/blog` (artículos) o `/` (proyectos).

- Artículos: `/blog/<slug>` si existe una versión española no borrador; si no, `/blog`.
- Proyectos: `/proyectos/<slug>` si el caso de estudio tiene `published: true`; si no, `/`.
- El generador lee el contenido con `readPosts` (`apps/web/scripts/blog-posts.mjs`), así que la tabla cambia al publicar o despublicar contenido.

#### Scenario: artículo antiguo ya no publicado
- WHEN el slug de `legacy.blogSlugs` no corresponde a un artículo publicado
- THEN su origen redirige a `/blog`

### web.redirecciones-referencia — La tabla es una referencia generada y comprobada

`docs/web/reference/redirecciones.md` se genera con el script y `cerebrox docs check` avisa (`reference-stale`) si difiere de lo que produciría.

- Regenerar: `node apps/web/scripts/generate-redirects.mjs` (también lo hace `pnpm build`).
- Comprobar: `node apps/web/scripts/generate-redirects.mjs --check` sale 1 si el fichero committed difiere; es el `docs.reference_check` de `cerebrox.yaml`.
- No necesita dependencias instaladas, solo `node`.

Why: una tabla copiada a mano en un bloque se queda atrás de `legacy.json`; generada y comprobada no puede.

#### Scenario: tabla editada a mano
- WHEN se edita una fila de `docs/web/reference/redirecciones.md`
- THEN `--check` sale con código 1 y `cerebrox docs check` avisa `reference-stale`
