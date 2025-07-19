import { z } from 'zod';

export const CertificationInput = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.date(),
  url: z.string().nullable().optional(),
  userId: z.string(),
});
export type CertificationInputDTO = z.infer<typeof CertificationInput>;

export const CertificationUpdateInput = z.object({
  id: z.string(),
  data: CertificationInput.partial(),
});
export type CertificationUpdateInputDTO = z.infer<typeof CertificationUpdateInput>;

export const CertificationId = z.object({ id: z.string() });
export type CertificationIdDTO = z.infer<typeof CertificationId>;

export type CertificationDTO = z.infer<typeof CertificationInput> & { id: string };
