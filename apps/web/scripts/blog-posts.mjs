// Lee la carpeta del blog: src/content/blog/<AAAA-MM-DD>-<clave>/{es,en}.mdx. Lo comparten los scripts de contenido.
import fs from 'node:fs';
import path from 'node:path';

export const BLOG_DIR = path.resolve(import.meta.dirname, '../src/content/blog');
export const FOLDER_RE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)$/;

const field = (front, key) => front.match(new RegExp(`^${key}:\\s*["']?([^"'\\n#]*?)["']?\\s*(?:#.*)?$`, 'm'))?.[1];

/** Devuelve una entrada por carpeta: { folder, date, key, langs: { es?: {file, text, slug, date, draft}, en?: … } }. */
export function readPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const m = e.name.match(FOLDER_RE);
      const langs = {};
      for (const lang of ['es', 'en']) {
        const file = ['mdx', 'md'].map((x) => path.join(BLOG_DIR, e.name, `${lang}.${x}`)).find((f) => fs.existsSync(f));
        if (!file) continue;
        const text = fs.readFileSync(file, 'utf8');
        const front = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
        langs[lang] = {
          file, text, title: field(front, 'title'), date: field(front, 'date'),
          slug: field(front, 'urlSlug') || m?.[2], draft: /^draft:\s*true\b/m.test(front),
        };
      }
      return { folder: e.name, valid: !!m, date: m?.[1], key: m?.[2], langs };
    })
    .sort((a, b) => b.folder.localeCompare(a.folder));
}
