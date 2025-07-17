import { z } from 'zod';

export const ProjectInput = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  userId: z.string(),
});
export type ProjectInputDTO = z.infer<typeof ProjectInput>;

export const ProjectUpdateInput = z.object({
  id: z.string(),
  data: ProjectInput.partial(),
});
export type ProjectUpdateInputDTO = z.infer<typeof ProjectUpdateInput>;

export const ProjectId = z.object({ id: z.string() });
export type ProjectIdDTO = z.infer<typeof ProjectId>;
