# CLAUDE.md — rubenrosales.dev

Web pública de rubenrosales.dev: servicios, proyectos y blog. Astro estático, contenido en Markdown y despliegue automático al hacer push a `main`.

## Fuentes de verdad

- **Diseño:** `apps/web/src/styles/tokens.css` y `docs/brand-guidelines.md`. Los componentes usan solo tokens semánticos (`--color-*`, `--space-*`, `--font-*`…), nunca primitivos (`--rr-*`) ni valores sueltos.
- **Contenido:** colecciones en `apps/web/src/content/` con esquema validado. Un frontmatter inválido debe romper el build.
- **Requisitos del rediseño:** `redesign-kit/specs/web-spec.md` (mientras exista el kit).

## Reglas de trabajo

- Antes de cambiar código, inspecciona la estructura, las dependencias y las convenciones afectadas. Cambios pequeños: quirúrgicos.
- **Antes del lanzamiento** se puede trabajar en `main`. **Desde que el dominio de producción apunta a este proyecto**, `main` = producción: trabaja en ramas y no hagas push ni merge a `main` sin aprobación explícita de Rubén.
- No conectes dominios, no crees cuentas o servicios de pago y no borres datos sin aprobación.
- Secretos solo en variables de entorno; nunca en el repo.
- Commits pequeños con Conventional Commits en español (`feat(blog): índice de contenidos con scrollspy`).
- Antes de añadir una dependencia, comprueba que está mantenida y que hace falta. Si no puedes verificar una API o versión, dilo; no la supongas.
- Sin sobreingeniería: estático por defecto, JS solo donde aporta, sin frameworks de UI salvo necesidad justificada.

## SEO (obligatorio en todo cambio)

Lo que se añada o modifique en la web (página, componente, ruta, artículo, proyecto, texto) cumple `docs/seo.md` **sin excepciones y sin dejarlo para después**. Resumen:

- Todo `<head>` sale de `Layout.astro`; no escribas metadatos a mano en una página.
- Título (≤ 60 caracteres, límite duro 65) y descripción (70–160) únicos por página. Una sola `<h1>`.
- Una página que solo existe en un idioma pasa `paths={{ es: '/ruta' }}`; nunca hay `hreflang` a URLs que no existen.
- Páginas sin valor en buscadores (archivo, etiquetas, paginación, 404): `noindex` y fuera del sitemap.
- JSON-LD solo desde `Layout` y solo con datos reales visibles en la página.
- Imágenes con `alt`, `width` y `height`; artículos con `cover` y `coverAlt`; URLs estables, y 301 si cambian.
- `pnpm build:prod` ejecuta las guardas de SEO (`scripts/check-build.mjs`) y debe pasar sin avisos antes de dar la tarea por terminada.

## Reglas de contenido

- Nunca inventes clientes, proyectos, cifras, resultados, testimonios, certificaciones ni tecnologías usadas.
- Textos en español, primera persona del singular, sin jerga ni superlativos, sin emojis (ver «Voz y tono» en la guía de marca).
- No publiques datos personales o laborales de Rubén que no estén en el copy aprobado.
- `[VERIFICAR: …]` marca datos pendientes de confirmar: nunca deben llegar a producción.

## Comandos

Desde la raíz (monorepo pnpm; ver `package.json`):

- `pnpm dev` (web, :4321) · `pnpm dev:api` (API, :3000, necesita `DATABASE_URL`)
- `pnpm check` (tipos de todos los paquetes) · `pnpm --filter @rr/api test` · `pnpm build`
- `pnpm i18n:check` (claves es/en de la interfaz)

Estructura: `apps/web` (Astro), `apps/api` (Hono + Postgres, ver `docs/api/backend.md`), `packages/shared` (contratos Zod). Antes de dar una tarea por terminada: check de tipos, tests, build (con las guardas de SEO), revisión visual y revisión de SEO según `docs/seo.md`.

## Blog

Ver `docs/escribir-un-post.md` y, para título, descripción, portada y URL, `docs/seo.md`. Un artículo = una carpeta `apps/web/src/content/blog/<AAAA-MM-DD>-<clave>/` con `es.mdx` y `en.mdx`. `pnpm content:list` los lista.
