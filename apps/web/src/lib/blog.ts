import { type CollectionEntry, getCollection } from 'astro:content';
import { type Lang, defaultLang, formatDate as formatDateIntl, getLocalizedPath } from '../i18n';

export type Post = CollectionEntry<'blog'>;

export const POSTS_PER_PAGE = 10;

/** El id de la entrada es «<idioma>/<slug>». */
export const postLang = (p: Post): Lang => p.id.split('/')[0] as Lang;
export const postSlug = (p: Post): string => p.id.split('/').slice(1).join('/');

/** En desarrollo se ven los borradores; en producción no. Más reciente primero. */
export async function getPosts(lang: Lang = defaultLang): Promise<Post[]> {
  const posts = await getCollection('blog', (p) => postLang(p) === lang && (import.meta.env.DEV || !p.data.draft));
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Artículo equivalente en otro idioma (mismo `translationKey`), si existe y es visible. */
export async function getTranslation(post: Post, lang: Lang): Promise<Post | undefined> {
  return (await getPosts(lang)).find((p) => p.data.translationKey === post.data.translationKey);
}

export function readingTime(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export const formatDate = (d: Date, lang: Lang = defaultLang) => formatDateIntl(lang, d);

export function tagCounts(posts: Post[]): [string, number][] {
  const map = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'));
}

export const postUrl = (p: Post) => getLocalizedPath(`/blog/${postSlug(p)}`, postLang(p));
export const pageUrl = (n: number, lang: Lang = defaultLang) => getLocalizedPath(n <= 1 ? '/blog' : `/blog/pagina/${n}`, lang);
