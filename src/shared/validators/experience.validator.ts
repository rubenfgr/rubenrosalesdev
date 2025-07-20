import { z } from 'zod';


export const ExperienceIdValidator = z.object({ id: z.string() });

export const ExperienceCreateValidator = z.object({
  company: z.string(),
  position: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  userId: z.string(),
});

export const ExperienceUpdateValidator = z.object({
  id: z.string(),
  data: ExperienceCreateValidator.partial(),
});

