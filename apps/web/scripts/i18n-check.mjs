// Comprueba que es y en tienen las mismas claves y ningún valor vacío o pendiente (TODO).
//  1. Textos de interfaz: src/i18n/ui/{es,en}.json
//  2. Colecciones de datos: src/content/<colección>/{es,en}.json (los elementos de una lista se emparejan por `id`)
//  3. Blog: cada carpeta <AAAA-MM-DD>-<clave> tiene es.mdx y en.mdx, y su fecha coincide con `date`
// Sale con código 1 si encuentra algo. Uso: node scripts/i18n-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { readPosts } from './blog-posts.mjs';

const root = path.resolve(import.meta.dirname, '..');
const LANGS = ['es', 'en'];
const problems = [];

/** Aplana un JSON a { 'a.b[id].c': valor }. Las listas de objetos con `id` se indexan por id. */
function flatten(node, prefix = '', out = {}) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      const key = item && typeof item === 'object' && typeof item.id === 'string' ? item.id : String(i);
      flatten(item, `${prefix}[${key}]`, out);
    });
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else {
    out[prefix] = node;
  }
  return out;
}

const isEmpty = (v) => v === null ? false : typeof v === 'string' && (v.trim() === '' || /\bTODO\b/.test(v));

function compare(label, files) {
  const flat = {};
  for (const lang of LANGS) {
    const file = files[lang];
    if (!fs.existsSync(file)) {
      problems.push(`${label}: falta ${path.relative(root, file)}`);
      return;
    }
    flat[lang] = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
  }
  const [a, b] = LANGS;
  for (const key of Object.keys(flat[a])) {
    if (!(key in flat[b])) problems.push(`${label}: falta en «${b}»: ${key}`);
  }
  for (const key of Object.keys(flat[b])) {
    if (!(key in flat[a])) problems.push(`${label}: sobra en «${b}» (no existe en «${a}»): ${key}`);
  }
  for (const lang of LANGS) {
    for (const [key, v] of Object.entries(flat[lang])) {
      if (isEmpty(v)) problems.push(`${label}: valor vacío o TODO en «${lang}»: ${key}`);
    }
  }
}

// 1. Interfaz
compare('ui', Object.fromEntries(LANGS.map((l) => [l, path.join(root, `src/i18n/ui/${l}.json`)])));

// 2. Colecciones con un fichero por idioma
const contentDir = path.join(root, 'src/content');
for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = path.join(contentDir, entry.name);
  if (!LANGS.some((l) => fs.existsSync(path.join(dir, `${l}.json`)))) continue;
  compare(entry.name, Object.fromEntries(LANGS.map((l) => [l, path.join(dir, `${l}.json`)])));
}

// 3. Blog: una carpeta por artículo con es y en; el prefijo de fecha coincide con `date` (también detecta TODO)
const slugs = { es: new Map(), en: new Map() };
for (const post of readPosts()) {
  if (!post.valid) {
    problems.push(`blog/${post.folder}: la carpeta debe llamarse AAAA-MM-DD-<clave> (minúsculas y kebab-case)`);
    continue;
  }
  for (const lang of LANGS) {
    const l = post.langs[lang];
    if (!l) {
      problems.push(`blog/${post.folder}: falta ${lang}.mdx (sin traducción «${lang}»)`);
      continue;
    }
    const where = `blog/${post.folder}/${lang}`;
    if (l.date !== post.date) problems.push(`${where}: la carpeta empieza por ${post.date} pero date es ${l.date}`);
    if (slugs[lang].has(l.slug)) problems.push(`${where}: slug repetido «${l.slug}» (también en ${slugs[lang].get(l.slug)})`);
    slugs[lang].set(l.slug, post.folder);
    // Pendiente = línea que solo dice TODO, valor «TODO» en el frontmatter o etiqueta todo (content:new).
    if (/^\s*TODO\s*$|:\s*["']?TODO["']?\s*$|^tags:.*\btodo\b/m.test(l.text)) problems.push(`${where}: contiene TODO`);
  }
}

if (problems.length) {
  console.error(`i18n:check — ${problems.length} problema(s)\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('i18n:check — es y en coinciden en interfaz, colecciones y blog.');
