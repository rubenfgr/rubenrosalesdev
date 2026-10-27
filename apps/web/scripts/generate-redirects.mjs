// Genera src/data/redirects.generated.json (lo aplica src/pages/[...path].ts) y docs/redirecciones.md (en la raíz del repo) a partir de src/data/legacy.json.
// El destino de cada artículo o proyecto antiguo depende del contenido actual:
// si sigue publicado, va a su URL nueva; si no, a /blog o /proyectos.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const repoRoot = path.resolve(root, '../..');
const legacy = JSON.parse(fs.readFileSync(path.join(root, 'src/data/legacy.json'), 'utf8'));

const frontmatter = (file) => fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
const flag = (fm, key) => new RegExp(`^${key}:\\s*true\\b`, 'm').test(fm);

import { readPosts } from './blog-posts.mjs';

const liveBlog = new Set(readPosts().filter((p) => p.langs.es && !p.langs.es.draft).map((p) => p.langs.es.slug));
const liveProjects = new Set();
const projDir = path.join(root, 'src/content/case-studies');
if (fs.existsSync(projDir)) {
  for (const f of fs.readdirSync(projDir).filter((n) => n.endsWith('.md'))) {
    if (flag(frontmatter(path.join(projDir, f)), 'published')) liveProjects.add(f.replace(/\.md$/, ''));
  }
}

const rows = []; // [origen, destino]
// /en ya es una ruta real del sitio (i18n): solo se redirige el prefijo /es heredado.
for (const prefix of legacy.prefixes.filter((x) => x !== '/en')) {
  for (const slug of legacy.blogSlugs) {
    rows.push([`${prefix}/blog/${slug}`, liveBlog.has(slug) ? `/blog/${slug}` : '/blog']);
  }
  for (const [old, next] of Object.entries(legacy.projects)) {
    rows.push([`${prefix}/projects/${old}`, next && liveProjects.has(next) ? `/proyectos/${next}` : '/']);
  }
  for (const p of legacy.pages) {
    rows.push([`${prefix}${p.from}`, p.to]);
    if (p.from === '') rows.push([`${prefix}/`, p.to]);
  }
}
// Páginas que ahora viven en la landing
for (const from of legacy.landingRedirects) rows.push([from, '/']);
// Reglas con comodín al final (las exactas primero).
rows.sort((a, b) => Number(a[0].includes('*')) - Number(b[0].includes('*')));
// Resto de rutas con prefijo: /es/x → /x (el español ya no lleva prefijo).
rows.push(['/es/*', '/:splat']);

fs.writeFileSync(path.join(root, 'src/data/redirects.generated.json'), `${JSON.stringify(rows, null, 1)}\n`);

const md = [
  '# Tabla de redirecciones',
  '',
  'Generada por `scripts/generate-redirects.mjs` desde `src/data/legacy.json` (no editar a mano).',
  'Todas son 301. El destino de artículos y proyectos depende de qué contenido está publicado.',
  '',
  '| Origen | Destino |',
  '|---|---|',
  ...rows.map(([from, to]) => `| \`${from}\` | \`${to}\` |`),
  '',
].join('\n');
fs.mkdirSync(path.join(repoRoot, 'docs'), { recursive: true });
fs.writeFileSync(path.join(repoRoot, 'docs/redirecciones.md'), md);
console.log(`Redirecciones: ${rows.length} reglas`);
