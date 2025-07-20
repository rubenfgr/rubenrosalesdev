import { z } from 'zod';
import { SKILL_LEVEL } from '../enums/skill-level.enum';

export const SkillLevelEnum = z.enum(SKILL_LEVEL);

export const TechStackIdValidator = z.object({ id: z.string() });

export const TechStackCreateValidator = z.object({
  name: z.string(),
  level: SkillLevelEnum.nullable().optional(),
});

export const TechStackUpdateValidator = z.object({
  id: z.string(),
  data: TechStackCreateValidator.partial(),
});

