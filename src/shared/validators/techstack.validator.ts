import { z } from 'zod';

export const TechStackIdValidator = z.object({ id: z.string() });

export const TechStackCreateValidator = z.object({
  name: z.string(),
  level: z.string().nullable().optional(),
});

export const TechStackUpdateValidator = z.object({
  id: z.string(),
  data: TechStackCreateValidator.partial(),
});

