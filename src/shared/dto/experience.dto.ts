import type { z } from "zod";
import type {
    ExperienceCreateValidator,
    ExperienceIdValidator,
    ExperienceUpdateValidator,
} from "../validators/experience.validator";

export type ExperienceCreateDTO = z.infer<typeof ExperienceCreateValidator>;

export type ExperienceUpdateDTO = z.infer<
    typeof ExperienceUpdateValidator
>;

export type ExperienceIdDTO = z.infer<typeof ExperienceIdValidator>;
