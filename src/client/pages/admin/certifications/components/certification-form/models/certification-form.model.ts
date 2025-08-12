import { z } from "zod";

// Base validators - single source of truth
function createBaseValidators(t: (key: string) => string) {
  return {
    name: z.string().min(2, { message: t("admin.certifications.form.validations.name_required") }),
    issuer: z.string().min(2, { message: t("admin.certifications.form.validations.issuer_required") }),
    date: z.date({ message: t("admin.certifications.form.validations.date_required") }),
    url: z.string().url({ message: t("admin.certifications.form.validations.url_invalid") }).or(z.literal("")),
    userId: z.string().min(1, { message: t("admin.certifications.form.validations.user_id_required") }),
  };
}

// Per-field validators for use in form.Field
export function getCertificationFieldValidators(t: (key: string) => string) {
  const validators = createBaseValidators(t);

  return {
    name: {
      onChange: validators.name,
    },
    issuer: {
      onChange: validators.issuer,
    },
    date: {
      onChange: validators.date,
    },
    url: {
      onChange: validators.url,
    },
    userId: {
      onChange: validators.userId,
    },
  };
}

export function getCertificationFormSchema(t: (key: string) => string) {
  const validators = createBaseValidators(t);

  return z.object({
    name: validators.name,
    issuer: validators.issuer,
    date: validators.date,
    url: validators.url,
    userId: validators.userId,
  });
}

export type CertificationFormValues = z.infer<ReturnType<typeof getCertificationFormSchema>>;
