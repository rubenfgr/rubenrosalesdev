import { type CollectionEntry, getCollection } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** En desarrollo se ven los no publicados; en producción solo `published: true`. */
export async function getProjects(onlyFeatured = false): Promise<Project[]> {
  const projects = await getCollection(
    'projects',
    (p) => (import.meta.env.DEV || p.data.published) && (!onlyFeatured || p.data.featured),
  );
  return projects.sort((a, b) => a.data.order - b.data.order);
}
