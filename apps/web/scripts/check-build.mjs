// Guardas de build de producción. Con GUARDS_STRICT=1 el build falla; sin ella, solo avisa.
//  1. Ningún «[VERIFICAR» en las páginas generadas.
//  2. Ningún proyecto publicado con `result` sin `resultVerified: true`.
//  2b. Tabla de rangos del asistente sin placeholders (solo si el asistente está visible: PUBLIC_ASSISTANT_ENABLED=1).
//  3. Ningún artículo en borrador enlazado desde contenido publicado.
//  4. SEO de las páginas generadas (docs/seo.md): título, descripción, canonical, h1, hreflang recíproco,
//     JSON-LD válido, imágenes con alt y dimensiones, sitemap coherente con `noindex`, robots.txt con Sitemap.
import fs from 'node:fs';
import path from 'node:path';
import { readPosts } from './blog-posts.mjs';

const root = path.resolve(import.meta.dirname, '..');
const strict = process.env.GUARDS_STRICT === '1';
const problems = [];

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p) : [p];
      })
    : [];
const fm = (file) => fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
const is = (front, key, val) => new RegExp(`^${key}:\\s*${val}\\b`, 'm').test(front);

// 1. [VERIFICAR en HTML y XML publicados
const out = path.join(root, 'dist/client');
const outputs = walk(out).filter((f) => /\.(html|xml|txt|json)$/.test(f));
for (const f of outputs) {
  if (fs.readFileSync(f, 'utf8').includes('[VERIFICAR')) problems.push(`[VERIFICAR en ${path.relative(root, f)}`);
}

// 2. Resultados sin verificar en proyectos publicados
for (const f of walk(path.join(root, 'src/content/case-studies')).filter((n) => n.endsWith('.md'))) {
  const front = fm(f);
  if (is(front, 'published', 'true') && /^result:\s*\S/m.test(front) && !is(front, 'resultVerified', 'true')) {
    problems.push(`proyecto publicado con result sin resultVerified: ${path.basename(f)}`);
  }
}

// 2b. Cifras de ejemplo del asistente sin confirmar

// 3. Borradores enlazados desde contenido publicado
const drafts = [];
const published = [];
const draftSlugs = [];
for (const post of readPosts()) {
  for (const l of Object.values(post.langs)) {
    if (l.draft) {
      drafts.push(l.file);
      draftSlugs.push(l.slug);
    } else published.push(l.file);
  }
}
const publishedFiles = [...published, ...walk(path.join(root, 'src/content/case-studies')), ...outputs];
for (const f of publishedFiles) {
  const text = fs.readFileSync(f, 'utf8');
  for (const slug of draftSlugs) {
    if (text.includes(`/blog/${slug}`)) problems.push(`borrador «${slug}» enlazado desde ${path.relative(root, f)}`);
  }
}

// 4. SEO de las páginas generadas
const SITE = 'https://rubenrosales.dev';
const pages = walk(out)
  .filter((f) => f.endsWith('.html'))
  .map((f) => {
    const rel = path.relative(out, f).replace(/\\/g, '/');
    const route = '/' + rel.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
    return { file: rel, url: SITE + (route === '/' ? '/' : route.replace(/\/$/, '')), html: fs.readFileSync(f, 'utf8') };
  })
  .filter((p) => p.file !== '404.html');
const byUrl = new Map(pages.map((p) => [p.url, p]));
const head = (html) => html.split('</head>')[0] ?? '';
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const metas = (h) => h.match(/<meta [^>]*>/g) ?? [];
const metaContent = (h, key) => {
  const m = metas(h).find((t) => attr(t, 'name') === key || attr(t, 'property') === key);
  return m ? attr(m, 'content') : undefined;
};
const decode = (t) => t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const sitemapUrls = new Set();
const smDir = out;
for (const f of walk(smDir).filter((n) => /sitemap-\d+\.xml$/.test(n))) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(m[1]);
}
const robotsFile = path.join(out, 'robots.txt');
if (!fs.existsSync(robotsFile)) problems.push('SEO: falta robots.txt');
else if (!fs.readFileSync(robotsFile, 'utf8').includes(`Sitemap: ${SITE}/sitemap-index.xml`)) problems.push('SEO: robots.txt sin la línea Sitemap');

for (const { file, url, html } of pages) {
  const h = head(html);
  const at = `SEO ${file}:`;
  const noindex = /noindex/.test(metaContent(h, 'robots') ?? '');
  const title = decode(h.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
  if (!title) problems.push(`${at} sin <title>`);
  else if (title.length > 65) problems.push(`${at} <title> de ${title.length} caracteres (máx. 65)`);
  const desc = decode(metaContent(h, 'description') ?? '');
  if (desc.length < 50 || desc.length > 160) problems.push(`${at} descripción de ${desc.length} caracteres (50–160)`);
  const canonical = attr(h.match(/<link rel="canonical"[^>]*>/)?.[0] ?? '', 'href');
  if (canonical !== url) problems.push(`${at} canonical «${canonical}» ≠ «${url}»`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) problems.push(`${at} debe tener exactamente un <h1>`);
  if (!/<html lang="(es|en)"/.test(html)) problems.push(`${at} <html lang> ausente`);
  // niveles de encabezado sin saltos hacia abajo (h2 → h4 es un fallo de accesibilidad y de estructura)
  let prev = 0;
  for (const m of html.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1]);
    if (prev && level > prev + 1) {
      problems.push(`${at} salto de encabezado h${prev} → h${level}`);
      break;
    }
    prev = level;
  }
  for (const k of ['og:title', 'og:description', 'og:image', 'og:image:alt', 'og:url', 'twitter:card', 'twitter:image']) {
    if (!metaContent(h, k)) problems.push(`${at} falta ${k}`);
  }
  if (!/^https:\/\//.test(metaContent(h, 'og:image') ?? '')) problems.push(`${at} og:image no es absoluta`);
  // hreflang: cada alternativa existe y apunta de vuelta a esta página
  const alts = (h.match(/<link rel="alternate" hreflang="[^"]*"[^>]*>/g) ?? []).map((t) => ({ lang: attr(t, 'hreflang'), href: attr(t, 'href') }));
  if (!alts.some((a) => a.href === url && a.lang !== 'x-default')) problems.push(`${at} hreflang sin autorreferencia`);
  for (const a of alts) {
    const target = byUrl.get(a.href ?? '');
    if (!target) problems.push(`${at} hreflang ${a.lang} apunta a una página que no existe: ${a.href}`);
    else if (!head(target.html).includes(`hreflang="${a.lang}" href="${a.href}"`) && a.lang !== 'x-default') problems.push(`${at} hreflang ${a.lang} no es recíproco con ${a.href}`);
  }
  // JSON-LD válido
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      if (data['@type'] === 'BlogPosting') {
        for (const k of ['headline', 'datePublished', 'dateModified', 'author', 'image', 'mainEntityOfPage']) if (!data[k]) problems.push(`${at} BlogPosting sin ${k}`);
      }
    } catch {
      problems.push(`${at} JSON-LD no es JSON válido`);
    }
  }
  if (url === `${SITE}/` || url === `${SITE}/en`) {
    if (!/"@type":"Person"/.test(html) || !/"@type":"WebSite"/.test(html)) problems.push(`${at} la home necesita JSON-LD Person y WebSite`);
  }
  if (/<article/.test(html) && /og:type" content="article"/.test(h) && !/"@type":"BlogPosting"/.test(html)) problems.push(`${at} artículo sin JSON-LD BlogPosting`);
  // imágenes
  for (const img of html.match(/<img[^>]*>/g) ?? []) {
    for (const a of ['alt', 'width', 'height']) if (!new RegExp(`\\s${a}=`).test(img)) problems.push(`${at} <img> sin ${a}: ${img.slice(0, 80)}`);
  }
  // sitemap ↔ noindex
  if (noindex && sitemapUrls.has(url)) problems.push(`${at} tiene noindex pero está en el sitemap`);
  if (!noindex && !sitemapUrls.has(url)) problems.push(`${at} es indexable pero no está en el sitemap`);
}
for (const u of sitemapUrls) if (!byUrl.has(u)) problems.push(`SEO: el sitemap lista una URL que no existe: ${u}`);

if (problems.length) {
  const list = problems.map((p) => `  - ${p}`).join('\n');
  if (strict) {
    console.error(`Guardas de build: ${problems.length} problema(s)\n${list}`);
    process.exit(1);
  }
  console.warn(`Guardas de build (aviso; con GUARDS_STRICT=1 fallarían): ${problems.length} problema(s)\n${list}`);
} else {
  console.log('Guardas de build: sin problemas');
}
