import type { z } from "zod";
import type {
  TechStackCreateValidator,
  TechStackIdValidator,
  TechStackUpdateValidator,
} from "@/shared/validators/techstack.validator";

export type TechStackIdDTO = z.infer<typeof TechStackIdValidator>;

export type TechStackDTO = z.infer<typeof TechStackCreateValidator> & {
  id: string;
};

export type TechStackCreateDTO = z.infer<typeof TechStackCreateValidator>;

export type TechStackUpdateDTO = z.infer<typeof TechStackUpdateValidator>;
