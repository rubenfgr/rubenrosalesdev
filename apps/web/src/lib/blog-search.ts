import type { Lang } from '../i18n';
import { formatDate, getPosts, postUrl, readingTime } from './blog';

/** Entrada del índice de búsqueda del blog (campos cortos para que el JSON pese poco). */
export interface SearchItem {
  u: string; // URL
  t: string; // título
  s: string; // descripción
  g: string[]; // etiquetas
  df: string; // fecha ya formateada en el idioma
  m: number; // minutos de lectura
  x: string; // texto del artículo en claro (recortado), solo para buscar
}

const MAX_TEXT = 6000;

/** MDX → texto plano aproximado: sin imports, bloques de código, etiquetas JSX ni marcas de Markdown. */
export function plainText(src: string | undefined): string {
  return (src ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*(import|export) .*$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>|~{}[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TEXT);
}

export async function searchIndexFor(lang: Lang): Promise<Response> {
  const posts = await getPosts(lang);
  const items: SearchItem[] = posts.map((p) => ({
    u: postUrl(p),
    t: p.data.title,
    s: p.data.description,
    g: [...p.data.tags],
    df: formatDate(p.data.date, lang),
    m: readingTime(p.body),
    x: plainText(p.body),
  }));
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
