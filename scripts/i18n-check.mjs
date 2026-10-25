// Comprueba que es y en tienen las mismas claves y ningún valor vacío o pendiente (TODO).
//  1. Textos de interfaz: src/i18n/ui/{es,en}.json
//  2. Colecciones de datos: src/content/<colección>/{es,en}.json (los elementos de una lista se emparejan por `id`)
//  3. Blog: cada artículo (translationKey) debe existir en los dos idiomas
// Sale con código 1 si encuentra algo. Uso: node scripts/i18n-check.mjs
import fs from 'node:fs';
import path from 'node:path';

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

// 3. Blog: pares por translationKey (también detecta TODO en el cuerpo)
const blog = { es: new Map(), en: new Map() };
for (const lang of LANGS) {
  const dir = path.join(contentDir, 'blog', lang);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((n) => /\.mdx?$/.test(n))) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const key = text.match(/^translationKey:\s*["']?([^"'\n]+?)["']?\s*$/m)?.[1];
    if (!key) {
      problems.push(`blog/${lang}/${f}: falta translationKey`);
      continue;
    }
    if (blog[lang].has(key)) problems.push(`blog/${lang}/${f}: translationKey repetido «${key}»`);
    blog[lang].set(key, f);
    if (/\bTODO\b/.test(text)) problems.push(`blog/${lang}/${f}: contiene TODO`);
  }
}
for (const lang of LANGS) {
  const other = LANGS.find((l) => l !== lang);
  for (const [key, f] of blog[lang]) {
    if (!blog[other].has(key)) problems.push(`blog/${lang}/${f}: no tiene traducción «${other}» (translationKey «${key}»)`);
  }
}

if (problems.length) {
  console.error(`i18n:check — ${problems.length} problema(s)\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('i18n:check — es y en coinciden en interfaz, colecciones y blog.');
