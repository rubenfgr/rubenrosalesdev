import { z } from 'zod';

export const TechStackInput = z.object({
  name: z.string(),
  level: z.string().nullable().optional(),
});
export type TechStackInputDTO = z.infer<typeof TechStackInput>;

export const TechStackUpdateInput = z.object({
  id: z.string(),
  data: TechStackInput.partial(),
});
export type TechStackUpdateInputDTO = z.infer<typeof TechStackUpdateInput>;

export const TechStackId = z.object({ id: z.string() });
export type TechStackIdDTO = z.infer<typeof TechStackId>;
