import z from "zod";


export const CertificationIdValidator = z.object({ id: z.uuid() });

export const CertificationCreateValidator = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.union([
    z.date(),
    z.string().refine(val => !Number.isNaN(Date.parse(val)), "Invalid date string")
  ]).transform(val => typeof val === "string" ? new Date(val) : val),
  url: z.string().nullable().optional(),
  userId: z.string(),
});

export const CertificationUpdateValidator = z.object({
  id: z.uuid(),
  data: CertificationCreateValidator.partial(),
});
