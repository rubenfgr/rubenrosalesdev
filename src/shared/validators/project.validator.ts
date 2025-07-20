import { z } from 'zod';

export const ProjectIdValidator = z.object({ id: z.uuid() });

export const ProjectCreateValidator = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  userId: z.string(),
});

export const ProjectUpdateValidator = z.object({
  id: z.uuid(),
  data: ProjectCreateValidator.partial(),
});

