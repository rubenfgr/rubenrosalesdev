import { z } from "zod";

export const certificationFormSchema = z.object({
  name: z.string().min(2),
  issuer: z.string().min(2),
  date: z.string().min(4),
  url: z.string().url().or(z.literal("")),
  userId: z.string().min(1),
});

export type CertificationFormValues = z.infer<typeof certificationFormSchema>;
