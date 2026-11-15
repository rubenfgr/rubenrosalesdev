# SEO: reglas de la web

Todo lo que se añada o cambie en la web (página, componente, artículo, proyecto, texto, ruta) cumple estas reglas. No son opcionales ni se dejan «para después». Las que se pueden comprobar con una máquina las comprueba `apps/web/scripts/check-build.mjs` (sección 4) y, con `pnpm build:prod`, un fallo rompe el build.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Metadatos, Open Graph, Twitter, `canonical`, `hreflang`, JSON-LD, iconos | `apps/web/src/layouts/Layout.astro` (única fuente; ninguna página escribe su propio `<head>`) |
| Datos del sitio (nombre, rol, redes, descripción de la home) | `apps/web/src/content/site/{es,en}.json` |
| `robots.txt`, iconos, manifiesto, imágenes OG por idioma | `apps/web/public/` |
| Sitemap (filtro y `lastmod`) | `apps/web/astro.config.mjs` + `apps/web/scripts/sitemap-lastmod.mjs` |
| RSS | `apps/web/src/lib/rss.ts` |
| Comprobaciones automáticas | `apps/web/scripts/check-build.mjs` |

## Reglas por página

1. **Una sola `<h1>`**, que describe la página. Los encabezados bajan sin saltos (`h2`, `h3`…).
2. **`title`**: único, descriptivo, con la palabra clave al principio. El `<title>` final no pasa de 60 caracteres (límite duro: 65). `Layout` añade « · Rubén Rosales» solo si cabe; si no, usa solo el título. No pongas el nombre a mano.
3. **`description`**: entre 70 y 160 caracteres, única por página, escrita para persuadir a hacer clic (no una lista de palabras clave). Toda página la pasa a `Layout`; no se hereda la de la home.
4. **`canonical`**: lo genera `Layout`. Sin barra final, sin parámetros, `https://rubenrosales.dev`. Un enlace interno, el RSS y el sitemap usan la misma forma.
5. **Idiomas (`hreflang`)**:
   - Una página que existe en es y en: `Layout` genera las alternativas solo.
   - Una página que existe en **un solo idioma** pasa `paths={{ es: '/ruta' }}` (o `en`). Nunca se declara una alternativa a una URL que no existe; el build lo comprueba, y también que sea recíproca.
   - Un artículo con distinto slug por idioma pasa `paths` con ambos.
6. **`noindex`**: páginas sin valor propio en un buscador (archivo, índice y páginas de etiquetas, paginación, búsqueda, 404, agradecimientos). Se marcan con `noindex` en `Layout`, no entran en el sitemap y siguen enlazando (`noindex, follow`). El build falla si una página `noindex` está en el sitemap o una indexable no está.
7. **Datos estructurados (JSON-LD)**: solo desde `Layout`, solo con datos reales y presentes en el contenido aprobado.
   - Home (es y en): `WebSite` y `Person`.
   - Artículos: `BlogPosting` y `BreadcrumbList`.
   - Páginas anidadas nuevas: pasan `breadcrumbs`.
   - Un tipo nuevo (`Service`, `FAQPage`, `CreativeWork`…) solo si la página muestra ese contenido al visitante. Nunca se marca contenido que no se ve ni se inventan campos (valoraciones, precios, direcciones).
8. **Imágenes**: `alt` descriptivo (vacío solo si es decorativa), `width` y `height` siempre, `loading="lazy"` salvo la imagen principal, formato `webp` o `avif` por `astro:assets`. Nada de texto dentro de una imagen que no esté también en el HTML.
9. **Open Graph**: toda página tiene `og:image` absoluta de 1200×630 con su `alt`. Los artículos usan su portada recortada automáticamente; el resto, `og-<idioma>.png`.
10. **Enlaces**: texto descriptivo (nada de «pulsa aquí»), internos sin dominio y sin barra final, externos con `rel="noopener"`. Una página nueva debe estar enlazada desde otra.
11. **URLs**: en minúsculas, sin tildes, con guiones, estables. Si una URL cambia, se añade la redirección 301 en `docs/redirecciones.md`.
12. **Rendimiento (afecta al posicionamiento)**: JavaScript solo en islas que lo necesiten, fuentes precargadas desde `Layout`, imágenes dimensionadas. No se añade un script de terceros sin justificarlo.
13. **Accesibilidad**: `lang` correcto, contraste, foco visible, textos alternativos. Va de la mano del SEO y se revisa a la vez.

## Reglas para artículos y contenido

- **Título** (`title`, máx. 65) con la palabra clave al principio y que prometa algo concreto. **Descripción** (70–160) distinta del primer párrafo.
- La **clave** de la carpeta y el `urlSlug` son la URL: cortos, con la palabra clave, sin fecha. Una vez publicados no se cambian.
- Cada artículo tiene `cover` y `coverAlt` (la portada es también la imagen para redes), entre 1 y 4 etiquetas existentes, y `updated` cuando se revisa de verdad (no para aparentar frescura).
- Estructura con `##` y `###`, un tema por artículo. Enlaza al menos a otro artículo o servicio de la web con un texto descriptivo.
- Se publica en **los dos idiomas** con `urlSlug` propio en cada uno. Si solo hay uno, es normal: `Layout` no declarará una alternativa que no exista.
- Nada se inventa (clientes, cifras, resultados): ver «Reglas de contenido» de `CLAUDE.md`.

## Qué hacer al añadir…

- **Una página nueva** → usa `Layout`; pasa `title`, `description`, `paths` si no está en los dos idiomas, `noindex` si procede y `breadcrumbs` si está anidada. Si es indexable, tiene que salir en el sitemap (es automático).
- **Un componente** → sin `<h1>` propios, imágenes con `alt` y dimensiones, enlaces con texto descriptivo.
- **Una ruta nueva o un cambio de URL** → redirección 301 de la antigua, y revisa los enlaces internos.
- **Un texto de la home o los servicios** → la descripción SEO (`site.json`) sigue siendo fiel al contenido y dentro de 160 caracteres.

## Comprobar antes de dar algo por terminado

1. `pnpm build:prod` pasa sin avisos de las guardas de SEO.
2. Mira el `<head>` de la página en `apps/web/dist/client/` (título, descripción, canonical, hreflang, JSON-LD, og:image).
3. Valida un tipo nuevo de JSON-LD con la herramienta de resultados enriquecidos de Google o `validator.schema.org`.
4. Tras desplegar: inspecciona la URL en Search Console, comprueba que el sitemap sigue aceptado y revisa Rendimiento y Core Web Vitals.

## Cosas que no se pueden automatizar y se hacen a mano

- **Cloudflare**: su `robots.txt` gestionado antepone sus señales de contenido al nuestro; comprobar tras cada cambio que sigue habiendo `Sitemap:` en `https://rubenrosales.dev/robots.txt`.
- **Search Console y Bing Webmaster Tools**: verificar el dominio y enviar `https://rubenrosales.dev/sitemap-index.xml`.
- **Core Web Vitals** reales (campo): se miran en Search Console, no en local.
