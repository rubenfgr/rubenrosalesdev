import { z } from 'zod';

export const ProfileIdValidator = z.object({ id: z.uuid() });

export const ProfileCreateValidator = z.object({
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  location: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  userId: z.string(),
});

export const ProfileUpdateValidator = z.object({
  id: z.uuid(),
  data: ProfileCreateValidator.partial(),
});

