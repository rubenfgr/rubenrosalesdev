// Crea una entrada nueva en español e inglés con el esquema rellenado y «TODO» donde falte contenido.
// Uso: pnpm content:new <colección> <slug> [slug-en]
//   Colecciones: projects, faq, process, problemTasks, blog
// Después de rellenar: pnpm i18n:check && pnpm check && pnpm build
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const [collection, slug, slugEn = slug] = process.argv.slice(2);
const year = new Date().getFullYear();
const today = new Date().toISOString().slice(0, 10);

const ITEMS = {
  projects: () => ({
    id: slug, featured: false, category: 'web', type: 'TODO', status: 'in-development', year,
    title: 'TODO', summary: 'TODO', includes: ['TODO'], draft: true,
  }),
  faq: () => ({ id: slug, question: 'TODO', answer: 'TODO' }),
  process: () => ({ id: slug, step: 'TODO', tag: 'TODO', title: 'TODO', body: 'TODO' }),
  problemTasks: () => ({ id: slug, label: 'TODO', path: 'TODO', hoursPerWeek: 1, defaultOn: false }),
};

const fail = (msg) => {
  console.error(`content:new — ${msg}`);
  process.exit(1);
};
if (!collection || !slug) fail('uso: pnpm content:new <colección> <slug> [slug-en]  (colecciones: projects, faq, process, problemTasks, blog)');
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugEn)) fail('el slug va en minúsculas y kebab-case');

if (collection === 'blog') {
  const files = { es: path.join(root, 'src/content/blog/es', `${slug}.mdx`), en: path.join(root, 'src/content/blog/en', `${slugEn}.mdx`) };
  for (const f of Object.values(files)) if (fs.existsSync(f)) fail(`ya existe ${path.relative(root, f)}`);
  for (const lang of ['es', 'en']) {
    fs.writeFileSync(
      files[lang],
      `---\ntitle: "TODO"\ndescription: "TODO"\ndate: ${today}\ntags: [todo]\ntranslationKey: ${slug}\ndraft: true\n---\n\nTODO\n`,
    );
    console.log(`creado ${path.relative(root, files[lang])}`);
  }
} else if (ITEMS[collection]) {
  for (const lang of ['es', 'en']) {
    const file = path.join(root, 'src/content', collection, `${lang}.json`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data.items.some((i) => i.id === slug)) fail(`«${slug}» ya existe en ${path.relative(root, file)}`);
    data.items.push(ITEMS[collection]());
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`añadido a ${path.relative(root, file)}`);
  }
} else {
  fail(`colección «${collection}» no soportada. Las demás (services, site, assistant…) se editan a mano: ver CONTENT.md`);
}
console.log('Rellena los TODO en los dos idiomas y ejecuta: pnpm i18n:check && pnpm check && pnpm build');
