import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  // Casos de estudio largos del diseño anterior (Markdown). El diseño nuevo usa `projects` (JSON por idioma).
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
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

// ── Colecciones de datos por idioma: src/content/<colección>/{es,en}.json ─────────────────────────
// Cada fichero es una entrada (id = 'es' | 'en'). Los ids de los elementos son iguales en ambos idiomas.
const byLocale = <T extends z.ZodType>(name: string, schema: T) =>
  defineCollection({ loader: glob({ pattern: '{es,en}.json', base: `./src/content/${name}` }), schema });

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id en minúsculas y kebab-case');
const text = z.string().min(1);

const services = byLocale(
  'services',
  z.object({
    items: z
      .array(
        z.object({
          id,
          number: text,
          name: text,
          title: text,
          body: text,
        }),
      )
      .length(4),
  }),
);

const projectCategory = z.enum(['ai-automation', 'web', 'app', 'sensors']);
const projects = byLocale(
  'projects',
  z.object({
    items: z.array(
      z.object({
        id,
        featured: z.boolean(),
        category: projectCategory,
        type: text,
        status: z.enum(['in-development', 'maintenance', 'done']),
        year: z.number().int().min(2015).max(2100),
        title: text,
        summary: text,
        includes: z.array(text).min(1).max(4),
      }),
    ),
  }),
);

const faq = byLocale('faq', z.object({ items: z.array(z.object({ id, question: text, answer: text })).min(1) }));

const process = byLocale(
  'process',
  z.object({ items: z.array(z.object({ id, step: z.string().regex(/^\d{2}$/), tag: text, title: text, body: text })).min(1) }),
);

const problemTasks = byLocale(
  'problemTasks',
  z.object({
    items: z.array(z.object({ id, label: text, path: text, hoursPerWeek: z.number().positive(), defaultOn: z.boolean() })).min(1),
  }),
);

const integrationCases = byLocale(
  'integrationCases',
  z.object({
    items: z
      .array(
        z.object({
          id,
          source: z.enum(['email', 'whatsapp', 'forms', 'pdf']),
          destination: z.enum(['erp', 'crm', 'excel', 'accounting']),
          sourceSub: text,
          pending: text,
          done: text,
          meta: text,
          steps: z.object({ read: text, check: text, register: text }),
          humanApproval: z.string().nullable(),
        }),
      )
      .min(1),
  }),
);

const trayItems = byLocale(
  'trayItems',
  z.object({
    items: z
      .array(
        z.object({
          id,
          tag: z.enum(['order', 'pdf', 'email']),
          title: text,
          from: text,
          confidence: z.number().min(0).max(100),
          done: text,
          why: text,
          approveLabel: text.optional(),
        }),
      )
      .min(1),
    modes: z.array(z.object({ id, label: text, description: text, threshold: z.number() })).length(3),
    log: z.array(z.object({ id, time: text, action: text, why: text, who: z.enum(['auto', 'approved', 'corrected']) })),
  }),
);

const link = z.object({ label: text, href: z.string().startsWith('/') });
const site = byLocale(
  'site',
  z.object({
    name: text,
    role: text,
    nav: z.array(z.object({ id, label: text, href: z.string().startsWith('/') })).min(1),
    cta: z.object({ short: text, long: text }),
    footer: z.object({ tagline: text, motto: text }),
    legal: z.array(link).min(1),
    seo: z.object({ title: text, description: text, ogImageAlt: text }),
    contact: z.object({ email: z.email(), responseTime: text }),
    social: z.array(z.object({ id, label: text, url: z.url() })).min(1),
  }),
);

const blog = defineCollection({
  // Un artículo por idioma: blog/es/<slug>.mdx y blog/en/<slug>.mdx. El id es «es/<slug>» o «en/<slug>».
  loader: glob({ pattern: '{es,en}/*.{md,mdx}', base: './src/content/blog' }),
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
        translationKey: id,
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

export const collections = {
  caseStudies,
  services,
  projects,
  faq,
  process,
  problemTasks,
  integrationCases,
  trayItems,
  site,
  blog,
};
