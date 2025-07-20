import { z } from "zod";
import { POST_STATUS } from "../enums/post-status.enum";

export const PostStatusEnum = z.enum(POST_STATUS);

export const PostIdValidator = z.object({ id: z.uuid() });

export const PostCreateValidator = z.object({
  title: z.string(),
  summary: z.string().optional(),
  content: z.string(),
  published: z.boolean().optional(),
  status: PostStatusEnum.optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.date().optional(),
  authorId: z.string(),
});

export const PostUpdateValidator = z.object({
  id: z.uuid(),
  data: PostCreateValidator.partial(),
});
