// Acceso a las colecciones de datos por idioma (src/content/<colección>/{es,en}.json).
import { type CollectionEntry, getEntry } from 'astro:content';
import type { Lang } from './index';

type LocaleCollection =
  | 'services'
  | 'projects'
  | 'faq'
  | 'process'
  | 'problemTasks'
  | 'integrationCases'
  | 'trayItems'
  | 'site'
  | 'assistant';

/** Devuelve los datos de una colección ya resueltos para el idioma. Falla si falta el fichero. */
export async function getData<C extends LocaleCollection>(collection: C, lang: Lang): Promise<CollectionEntry<C>['data']> {
  const entry = (await getEntry(collection, lang)) as CollectionEntry<C> | undefined;
  if (!entry) throw new Error(`content: falta src/content/${collection}/${lang}.json`);
  return entry.data;
}
