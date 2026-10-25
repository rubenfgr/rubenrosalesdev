# CONTENT.md — contenido y traducciones

Cómo añadir contenido nuevo (en español e inglés) sin tocar componentes. Complementa `docs/escribir-un-post.md` (blog) y `docs/asistente.md`.

## Dónde va cada cosa

| Qué | Dónde | Cómo se edita |
|---|---|---|
| Textos de interfaz (botones, etiquetas, aria, errores, titulares de sección) | `src/i18n/ui/{es,en}.json` | A mano; claves anidadas por sección (`hero.ctaPrimary`, `contact.errors.emailInvalid`) |
| Servicios (4) | `src/content/services/{es,en}.json` | A mano |
| Proyectos | `src/content/projects/{es,en}.json` | `pnpm content:new projects <slug>` |
| FAQ | `src/content/faq/{es,en}.json` | `pnpm content:new faq <slug>` |
| Pasos del método | `src/content/process/{es,en}.json` | `pnpm content:new process <slug>` |
| Tareas del diagnóstico | `src/content/problemTasks/{es,en}.json` | `pnpm content:new problemTasks <slug>` |
| Casos de «Integraciones», bandeja de «Cómo funciona» | `src/content/integrationCases`, `trayItems` | A mano |
| Navegación, footer, SEO, contacto, redes | `src/content/site/{es,en}.json` | A mano |
| Asistente (guiones, bio, tarjetas) | `src/content/assistant/{es,en}.json` | A mano |
| Rangos de precio del asistente (sin idioma) | `src/content/assistant/pricing.json` | A mano; `placeholder: true` hasta confirmar |
| Artículos | `src/content/blog/{es,en}/<slug>.mdx` | `pnpm content:new blog <slug> [slug-en]` |
| Casos de estudio largos (diseño anterior, sin usar) | `src/content/case-studies/*.md` | — |

Regla de oro: **mismo `id` en `es` y `en`** (en blog, mismo `translationKey`). Los esquemas Zod están en `src/content.config.ts`.

## Esquemas (resumen)

- **projects** → `items[]`: `id`, `featured` (los 4 primeros destacados llevan mock animado en `Proyectos.tsx`; no marques más como destacados sin pedir el mock), `category` (`ai-automation|web|app|sensors`), `type`, `status` (`in-development|maintenance|done`), `year`, `title`, `summary`, `includes[1–4]`, `draft` (true = solo visible en desarrollo).
- **faq** → `items[]`: `id`, `question`, `answer`.
- **process** → `items[]`: `id`, `step` (`"01"`), `tag`, `title`, `body`.
- **problemTasks** → `items[]`: `id`, `label`, `path`, `hoursPerWeek`, `defaultOn`.
- **blog** → frontmatter: `title` (≤ 70), `description` (50–160), `date`, `tags` (1–4, kebab-case), `translationKey`, `draft`, opcional `updated`, `cover` + `coverAlt`.

Ejemplo (proyecto):

```json
{ "id": "mi-proyecto", "featured": false, "category": "web", "type": "Web", "status": "maintenance", "year": 2024,
  "title": "…", "summary": "…", "includes": ["…", "…"], "draft": false }
```

## Flujo para crear contenido

1. `pnpm content:new <colección> <slug>` (blog: `pnpm content:new blog <slug> [slug-en]`). Crea la entrada en `es` y `en` con `TODO` donde falta contenido.
2. Rellena los `TODO` **en los dos idiomas**.
3. `pnpm i18n:check` — lista claves que faltan, sobran, valores vacíos o `TODO`, y artículos sin traducción.
4. `pnpm check && pnpm build` — los esquemas Zod validan todo; un frontmatter inválido rompe el build.

Si pasan 3 y 4, la entrada está completa y válida en los dos idiomas.

## Tono

- **Español de España**, primera persona del singular, cercano y directo. Sin jerga ni superlativos, sin emojis (ver «Voz y tono» en `docs/brand-guidelines.md`).
- **Inglés** natural, no literal: reescribe la frase, no traduzcas palabra por palabra. Mismo registro (cercano, directo, sin superlativos). Inglés británico en cifras y fechas (`Intl` ya usa `en-GB`).
- Los nombres propios, productos y cifras no se traducen.

## Reglas de contenido (no negociables)

- No inventes clientes, proyectos, cifras, resultados, testimonios, certificaciones ni tecnologías usadas.
- Lo pendiente de confirmar va como `[VERIFICAR: …]`; con `GUARDS_STRICT=1` el build falla si queda alguno en las páginas, o si `pricing.json` conserva `placeholder: true`.
- No publiques datos personales o laborales de Rubén que no estén en el copy aprobado.

## Checklist de publicación

- [ ] Entrada en `es` y `en`, mismo `id` / `translationKey`.
- [ ] Sin `TODO` ni `[VERIFICAR…]`; `draft` en `false` (o `draft` quitado).
- [ ] `pnpm i18n:check`, `pnpm check` y `pnpm build` sin errores.
- [ ] Revisión visual en `/` y `/en` (1280 px y 390 px).
- [ ] Trabajo en una rama; push o merge a `main` solo con aprobación de Rubén.
- [ ] Para el lanzamiento: `pnpm build:prod` (`GUARDS_STRICT=1`).
