import z from "zod";


export const CertificationIdValidator = z.object({ id: z.string() });

export const CertificationCreateValidator = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.date(),
  url: z.string().nullable().optional(),
  userId: z.string(),
});

export const CertificationUpdateValidator = z.object({
  id: z.string(),
  data: CertificationCreateValidator.partial(),
});
