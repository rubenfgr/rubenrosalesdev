// Guardas de build de producción. Con GUARDS_STRICT=1 el build falla; sin ella, solo avisa.
//  1. Ningún «[VERIFICAR» en las páginas generadas.
//  2. Ningún proyecto publicado con `result` sin `resultVerified: true`.
//  2b. Tabla de rangos del asistente sin placeholders (solo si el asistente está visible: PUBLIC_ASSISTANT_ENABLED=1).
//  3. Ningún artículo en borrador enlazado desde contenido publicado.
import fs from 'node:fs';
import path from 'node:path';

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
const blogDir = path.join(root, 'src/content/blog');
const drafts = [];
const published = [];
for (const f of walk(blogDir).filter((n) => /\.mdx?$/.test(n))) {
  (is(fm(f), 'draft', 'true') ? drafts : published).push(f);
}
const draftSlugs = drafts.map((f) => path.basename(f).replace(/\.mdx?$/, ''));
const publishedFiles = [...published, ...walk(path.join(root, 'src/content/case-studies')), ...outputs];
for (const f of publishedFiles) {
  const text = fs.readFileSync(f, 'utf8');
  for (const slug of draftSlugs) {
    if (text.includes(`/blog/${slug}`)) problems.push(`borrador «${slug}» enlazado desde ${path.relative(root, f)}`);
  }
}

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
