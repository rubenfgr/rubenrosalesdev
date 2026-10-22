import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../lib/blog';

export async function GET(context: APIContext) {
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  return rss({
    title: 'Blog de Rubén Rosales',
    description: 'Notas prácticas sobre automatización, IA aplicada y software para negocio.',
    site: context.site ?? 'https://rubenrosales.dev',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: p.data.tags,
    })),
    customData: '<language>es-es</language>',
  });
}
