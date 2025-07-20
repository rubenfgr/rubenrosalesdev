import { z } from 'zod';

export const ProfileInput = z.object({
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  location: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  userId: z.string(),
});
export type ProfileInputDTO = z.infer<typeof ProfileInput>;

export const ProfileUpdateInput = z.object({
  id: z.string(),
  data: ProfileInput.partial(),
});
export type ProfileUpdateInputDTO = z.infer<typeof ProfileUpdateInput>;

export const ProfileId = z.object({ id: z.string() });
export type ProfileIdDTO = z.infer<typeof ProfileId>;
