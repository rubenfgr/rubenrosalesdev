import { z } from 'zod';

export const PostInput = z.object({
  title: z.string(),
  summary: z.string().optional(),
  content: z.string(),
  published: z.boolean().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.date().optional(),
  authorId: z.string(),
});
export type PostInputDTO = z.infer<typeof PostInput>;

export const PostUpdateInput = z.object({
  id: z.string(),
  data: PostInput.partial(),
});
export type PostUpdateInputDTO = z.infer<typeof PostUpdateInput>;

export const PostId = z.object({ id: z.string() });
export type PostIdDTO = z.infer<typeof PostId>;
