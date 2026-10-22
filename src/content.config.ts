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

export const collections = { projects };
