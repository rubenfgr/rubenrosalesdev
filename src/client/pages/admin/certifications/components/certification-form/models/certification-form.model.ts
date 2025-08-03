// Per-field validators for use in form.validations.Field
export function getCertificationFieldValidators(t: (key: string) => string) {
  return {
    name: {
      onChange: z
        .string()
        .min(2, { message: t("admin.certifications.form.validations.name_required") }),
    },
    issuer: {
      onChange: z
        .string()
        .min(2, { message: t("admin.certifications.form.validations.issuer_required") }),
    },
    date: {
      onChange: z
        .string()
        .min(4, { message: t("admin.certifications.form.validations.date_required") }),
    },
    url: {
      onChange: z
        .string()
        .url({ message: t("admin.certifications.form.validations.url_invalid") })
        .or(z.literal("")),
    },
    userId: {
      onChange: z
        .string()
        .min(1, { message: t("admin.certifications.form.validations.user_id_required") }),
    },
  };
}

import { z } from "zod";

export function getCertificationFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, { message: t("admin.certifications.form.validations.name_required") }),
    issuer: z
      .string()
      .min(2, { message: t("admin.certifications.form.validations.issuer_required") }),
    date: z.string().min(4, { message: t("admin.certifications.form.validations.date_required") }),
    url: z
      .string()
      .url({ message: t("admin.certifications.form.validations.url_invalid") })
      .or(z.literal("")),
    userId: z
      .string()
      .min(1, { message: t("admin.certifications.form.validations.user_id_required") }),
  });
}

export type CertificationFormValues = z.infer<ReturnType<typeof getCertificationFormSchema>>;
