import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(200),
    category: z.enum(['automatizacion', 'web', 'movil', 'iot']),
    context: z.enum(['profesional', 'propio', 'cliente']),
    stack: z.array(z.string()).min(1),
    result: z.string().optional(),
    resultVerified: z.boolean().default(false),
    featured: z.boolean().default(false),
    order: z.number().default(100),
    published: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  // Un artículo = una carpeta con `index.md`; el slug es el nombre de la carpeta.
  loader: glob({
    pattern: '*/index.{md,mdx}',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.split('/')[0] ?? entry,
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().max(70),
        description: z.string().min(50).max(160),
        date: z.coerce.date(),
        updated: z.coerce.date().optional(),
        tags: z
          .array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'etiqueta en minúsculas y kebab-case'))
          .min(1)
          .max(4),
        draft: z.boolean().default(false),
        cover: image().optional(),
        coverAlt: z.string().optional(),
      })
      .strict()
      .refine((d) => !d.cover || !!d.coverAlt, {
        message: 'coverAlt es obligatorio si hay cover',
        path: ['coverAlt'],
      }),
});

export const collections = { projects, blog };
