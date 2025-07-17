import { z } from 'zod';

export const ExperienceInput = z.object({
  company: z.string(),
  position: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  userId: z.string(),
});
export type ExperienceInputDTO = z.infer<typeof ExperienceInput>;

export const ExperienceUpdateInput = z.object({
  id: z.string(),
  data: ExperienceInput.partial(),
});
export type ExperienceUpdateInputDTO = z.infer<typeof ExperienceUpdateInput>;

export const ExperienceId = z.object({ id: z.string() });
export type ExperienceIdDTO = z.infer<typeof ExperienceId>;
