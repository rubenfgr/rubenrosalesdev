import { z } from 'zod';

export const PostIdValidator = z.object({ id: z.string() });

export const PostCreateValidator = z.object({
  title: z.string(),
  summary: z.string().optional(),
  content: z.string(),
  published: z.boolean().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.date().optional(),
  authorId: z.string(),
});

export const PostUpdateValidator = z.object({
  id: z.string(),
  data: PostCreateValidator.partial(),
});

