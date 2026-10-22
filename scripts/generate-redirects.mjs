// Genera public/_redirects (Cloudflare) y docs/redirecciones.md a partir de src/data/legacy.json.
// El destino de cada artículo o proyecto antiguo depende del contenido actual:
// si sigue publicado, va a su URL nueva; si no, a /blog o /proyectos.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const legacy = JSON.parse(fs.readFileSync(path.join(root, 'src/data/legacy.json'), 'utf8'));

const frontmatter = (file) => fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
const flag = (fm, key) => new RegExp(`^${key}:\\s*true\\b`, 'm').test(fm);

const liveBlog = new Set();
const blogDir = path.join(root, 'src/content/blog');
if (fs.existsSync(blogDir)) {
  for (const slug of fs.readdirSync(blogDir)) {
    const file = path.join(blogDir, slug, 'index.md');
    if (fs.existsSync(file) && !flag(frontmatter(file), 'draft')) liveBlog.add(slug);
  }
}
const liveProjects = new Set();
const projDir = path.join(root, 'src/content/projects');
if (fs.existsSync(projDir)) {
  for (const f of fs.readdirSync(projDir).filter((n) => n.endsWith('.md'))) {
    if (flag(frontmatter(path.join(projDir, f)), 'published')) liveProjects.add(f.replace(/\.md$/, ''));
  }
}

const rows = []; // [origen, destino]
for (const prefix of legacy.prefixes) {
  for (const slug of legacy.blogSlugs) {
    rows.push([`${prefix}/blog/${slug}`, liveBlog.has(slug) ? `/blog/${slug}` : '/blog']);
  }
  for (const [old, next] of Object.entries(legacy.projects)) {
    rows.push([`${prefix}/projects/${old}`, next && liveProjects.has(next) ? `/proyectos/${next}` : '/proyectos']);
  }
  for (const p of legacy.pages) {
    rows.push([`${prefix}${p.from}`, p.to]);
    if (p.from === '') rows.push([`${prefix}/`, p.to]);
  }
}
// Resto de rutas con prefijo: /es/x → /x (el español ya no lleva prefijo); /en/x → inicio.
rows.push(['/es/*', '/:splat'], ['/en/*', '/']);

const redirects = rows.map(([from, to]) => `${from} ${to} 301`).join('\n') + '\n';
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/_redirects'), redirects);

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
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/redirecciones.md'), md);
console.log(`Redirecciones: ${rows.length} reglas`);
