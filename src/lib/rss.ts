import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { type Lang, intlLocale, t as makeT } from '../i18n';
import { getPosts, postUrl } from './blog';

export async function rssFor(lang: Lang, context: APIContext) {
  const t = makeT(lang);
  const posts = await getPosts(lang);
  return rss({
    title: t('meta.rssTitle'),
    description: t('meta.rssDescription'),
    site: context.site ?? 'https://rubenrosales.dev',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: p.data.tags,
    })),
    customData: `<language>${intlLocale[lang].toLowerCase()}</language>`,
  });
}
