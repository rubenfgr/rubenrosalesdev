import type { z } from "zod";
import type {
  ProfileCreateValidator,
  ProfileIdValidator,
  ProfileUpdateValidator,
} from "@/shared/validators/profile.validator";

export type ProfileIdDTO = z.infer<typeof ProfileIdValidator>;

export type ProfileDTO = z.infer<typeof ProfileCreateValidator> & {
  id: string;
};

export type ProfileCreateDTO = z.infer<typeof ProfileCreateValidator>;

export type ProfileUpdateDTO = z.infer<typeof ProfileUpdateValidator>;
