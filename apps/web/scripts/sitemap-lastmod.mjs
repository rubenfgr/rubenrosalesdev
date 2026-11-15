// `lastmod` del sitemap: solo para lo que tiene una fecha real (los artículos y el índice del blog por idioma).
import { readPosts } from './blog-posts.mjs';

/** @type {Map<string, string>} ruta (sin barra final) → fecha ISO */
export const sitemapLastmod = new Map();

const latest = { es: '', en: '' };
for (const post of readPosts()) {
  for (const [lang, l] of Object.entries(post.langs)) {
    if (l.draft || !l.date) continue;
    const date = l.updated || l.date;
    sitemapLastmod.set(`${lang === 'es' ? '' : '/en'}/blog/${l.slug}`, new Date(date).toISOString());
    if (date > latest[lang]) latest[lang] = date;
  }
}
for (const lang of ['es', 'en']) {
  if (latest[lang]) sitemapLastmod.set(`${lang === 'es' ? '' : '/en'}/blog`, new Date(latest[lang]).toISOString());
}
