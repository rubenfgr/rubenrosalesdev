import type { APIContext } from 'astro';
import { rssFor } from '../lib/rss';

export const GET = (context: APIContext) => rssFor('es', context);
