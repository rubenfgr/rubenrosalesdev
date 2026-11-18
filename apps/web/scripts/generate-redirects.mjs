// Genera src/data/redirects.generated.json (lo aplica src/pages/[...path].ts) y docs/web/reference/redirecciones.md (en la raíz del repo) a partir de src/data/legacy.json.
// Con `--check` no escribe nada: sale 1 si la tabla committed difiere de la generada (la usa `docs.reference_check` de cerebrox.yaml).
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

const md = [
  '<!-- Generado por `node apps/web/scripts/generate-redirects.mjs` desde `apps/web/src/data/legacy.json`; generado, no editar. Cambia el origen y regenera. -->',
  '',
  '# Tabla de redirecciones',
  '',
  'Todas son 301. El destino de artículos y proyectos depende de qué contenido está publicado. Cómo funcionan: [[web.redirecciones-301]].',
  '',
  '| Origen | Destino |',
  '|---|---|',
  ...rows.map(([from, to]) => `| \`${from}\` | \`${to}\` |`),
  '',
].join('\n');
const mdPath = path.join(repoRoot, 'docs/web/reference/redirecciones.md');
if (process.argv.includes('--check')) {
  const current = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
  if (current !== md) {
    console.error('docs/web/reference/redirecciones.md no coincide con la tabla generada: ejecuta `node apps/web/scripts/generate-redirects.mjs`.');
    process.exit(1);
  }
  console.log('Redirecciones: tabla al día');
  process.exit(0);
}
fs.writeFileSync(path.join(root, 'src/data/redirects.generated.json'), `${JSON.stringify(rows, null, 1)}\n`);
fs.mkdirSync(path.dirname(mdPath), { recursive: true });
fs.writeFileSync(mdPath, md);
console.log(`Redirecciones: ${rows.length} reglas`);
