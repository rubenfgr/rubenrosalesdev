import type { z } from "zod";
import type {
  ProjectCreateValidator,
  ProjectIdValidator,
  ProjectUpdateValidator,
} from "@/shared/validators/project.validator";

export type ProjectIdDTO = z.infer<typeof ProjectIdValidator>;

export type ProjectDTO = z.infer<typeof ProjectCreateValidator> & {
  id: string;
};

export type ProjectCreateDTO = z.infer<typeof ProjectCreateValidator>;

export type ProjectUpdateDTO = z.infer<typeof ProjectUpdateValidator>;
