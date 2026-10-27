// Lista los artículos del blog, del más nuevo al más antiguo. Uso: pnpm content:list [blog]
import { readPosts } from './blog-posts.mjs';

const rows = readPosts().map((p) => {
  const es = p.langs.es, en = p.langs.en;
  const estado = [es, en].every((l) => l && !l.draft) ? 'publicado' : [es, en].every((l) => !l || l.draft) ? 'borrador' : 'mixto';
  return { fecha: p.date ?? '?', carpeta: p.folder, es: es ? 'sí' : 'FALTA', en: en ? 'sí' : 'FALTA', estado, 'slug es': es?.slug ?? '-', 'slug en': en?.slug ?? '-' };
});
if (!rows.length) console.log('No hay artículos.');
else console.table(rows);
