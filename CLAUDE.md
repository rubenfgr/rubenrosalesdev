# CLAUDE.md — rubenrosales.dev

Web pública de rubenrosales.dev: servicios, proyectos y blog. Astro estático, contenido en Markdown y despliegue automático al hacer push a `main`.

## Fuentes de verdad

- **Diseño:** `src/styles/tokens.css` y `docs/brand-guidelines.md`. Los componentes usan solo tokens semánticos (`--color-*`, `--space-*`, `--font-*`…), nunca primitivos (`--rr-*`) ni valores sueltos.
- **Contenido:** colecciones en `src/content/` con esquema validado. Un frontmatter inválido debe romper el build.
- **Requisitos del rediseño:** `redesign-kit/specs/web-spec.md` (mientras exista el kit).

## Reglas de trabajo

- Antes de cambiar código, inspecciona la estructura, las dependencias y las convenciones afectadas. Cambios pequeños: quirúrgicos.
- **Antes del lanzamiento** se puede trabajar en `main`. **Desde que el dominio de producción apunta a este proyecto**, `main` = producción: trabaja en ramas y no hagas push ni merge a `main` sin aprobación explícita de Rubén.
- No conectes dominios, no crees cuentas o servicios de pago y no borres datos sin aprobación.
- Secretos solo en variables de entorno; nunca en el repo.
- Commits pequeños con Conventional Commits en español (`feat(blog): índice de contenidos con scrollspy`).
- Antes de añadir una dependencia, comprueba que está mantenida y que hace falta. Si no puedes verificar una API o versión, dilo; no la supongas.
- Sin sobreingeniería: estático por defecto, JS solo donde aporta, sin frameworks de UI salvo necesidad justificada.

## Reglas de contenido

- Nunca inventes clientes, proyectos, cifras, resultados, testimonios, certificaciones ni tecnologías usadas.
- Textos en español, primera persona del singular, sin jerga ni superlativos, sin emojis (ver «Voz y tono» en la guía de marca).
- No publiques datos personales o laborales de Rubén que no estén en el copy aprobado.
- `[VERIFICAR: …]` marca datos pendientes de confirmar: nunca deben llegar a producción.

## Comandos

Ver `package.json`. Antes de dar una tarea por terminada: check de tipos, build y revisión visual.

## Blog

Ver `docs/escribir-un-post.md`. Un artículo = una carpeta en `src/content/blog/<slug>/` con `index.md`.
