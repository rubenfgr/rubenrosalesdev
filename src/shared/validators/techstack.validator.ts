import { z } from "zod";
import { SKILL_LEVEL } from "@/shared/enums";

export const SkillLevelEnum = z.enum(SKILL_LEVEL);

export const TechStackIdValidator = z.object({ id: z.uuid() });

export const TechStackCreateValidator = z.object({
  name: z.string(),
  level: SkillLevelEnum.nullable().optional(),
});

export const TechStackUpdateValidator = z.object({
  id: z.uuid(),
  data: TechStackCreateValidator.partial(),
});
