import type { z } from "zod";
import type {
  PostCreateValidator,
  PostIdValidator,
  PostUpdateValidator,
} from "@/shared/validators/post.validator";

export type PostIdDTO = z.infer<typeof PostIdValidator>;

export type PostDTO = z.infer<typeof PostCreateValidator> & {
  id: string;
};

export type PostCreateDTO = z.infer<typeof PostCreateValidator>;

export type PostUpdateDTO = z.infer<typeof PostUpdateValidator>;
