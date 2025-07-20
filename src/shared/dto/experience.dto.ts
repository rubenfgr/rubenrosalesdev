import type { z } from "zod";
import type {
  ExperienceCreateValidator,
  ExperienceIdValidator,
  ExperienceUpdateValidator,
} from "@/shared/validators/experience.validator";

export type ExperienceIdDTO = z.infer<typeof ExperienceIdValidator>;

export type ExperienceDTO = z.infer<typeof ExperienceCreateValidator> & {
  id: string;
};

export type ExperienceCreateDTO = z.infer<typeof ExperienceCreateValidator>;

export type ExperienceUpdateDTO = z.infer<typeof ExperienceUpdateValidator>;
