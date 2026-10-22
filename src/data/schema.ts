import { z } from 'astro/zod';

const link = z.object({ href: z.string().startsWith('/'), label: z.string().min(1) });

export const siteSchema = z.object({
  name: z.string(),
  url: z.url(),
  title: z.string(),
  description: z.string(),
  descriptor: z.string(),
  tagline: z.string(),
  github: z.url(),
  repo: z.url(),
  linkedin: z.url(),
});

export const ownerSchema = z.object({
  name: z.string(),
  nif: z.string(),
  address: z.string(),
  email: z.email(),
});

export const navigationSchema = z.object({ main: z.array(link), legal: z.array(link) });

export const serviceSchema = z.object({
  id: z.enum(['automatizacion', 'web', 'movil']),
  title: z.string(),
  summary: z.string(),
  points: z.array(z.string()).min(1),
  forWhom: z.string(),
  receive: z.string(),
  notRecommended: z.string(),
});

export const demoSchema = z.object({
  label: z.string(),
  before: z.string(),
  steps: z.array(z.object({ title: z.string(), text: z.string() })).min(2),
  after: z.string(),
  fine: z.string(),
});

export const aboutSchema = z.object({
  principles: z.array(z.object({ title: z.string(), text: z.string() })),
  education: z.array(z.string()),
});

export const contactSchema = z.object({ serviceOptions: z.array(z.string()).min(1) });

export type Service = z.infer<typeof serviceSchema>;
