import { type CollectionEntry, getCollection } from 'astro:content';
import { type Lang, defaultLang, formatDate as formatDateIntl, getLocalizedPath } from '../i18n';

export type Post = CollectionEntry<'blog'>;

export const POSTS_PER_PAGE = 10;

/** El id de la entrada es «<AAAA-MM-DD>-<clave>/<idioma>». */
export const postLang = (p: Post): Lang => p.id.split('/')[1] as Lang;
/** Clave del artículo: la carpeta sin el prefijo de fecha. Empareja es y en. */
export const postKey = (p: Post): string => p.id.split('/')[0]!.replace(/^\d{4}-\d{2}-\d{2}-/, '');
/** Slug de la URL: el `urlSlug` del frontmatter o, si no hay, la clave. */
export const postSlug = (p: Post): string => p.data.urlSlug ?? postKey(p);

/** El prefijo de fecha de la carpeta debe coincidir con `date`; si no, el build falla. */
function checkDatePrefix(p: Post) {
  const prefix = p.id.split('/')[0]!.slice(0, 10);
  if (prefix !== p.data.date.toISOString().slice(0, 10)) {
    throw new Error(`blog/${p.id}: la carpeta empieza por ${prefix} pero date es ${p.data.date.toISOString().slice(0, 10)}`);
  }
}

/** En desarrollo se ven los borradores; en producción no. Más reciente primero. */
export async function getPosts(lang: Lang = defaultLang): Promise<Post[]> {
  const posts = await getCollection('blog', (p) => postLang(p) === lang && (import.meta.env.DEV || !p.data.draft));
  posts.forEach(checkDatePrefix);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Artículo equivalente en otro idioma (misma carpeta), si existe y es visible. */
export async function getTranslation(post: Post, lang: Lang): Promise<Post | undefined> {
  return (await getPosts(lang)).find((p) => postKey(p) === postKey(post));
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
