import { useForm } from "@tanstack/react-form";
import { AppInput } from "@/client/components/app-input/app-input.component";
import { Button } from "@/client/components/ui";
import { useClientTranslation } from "@/client/hooks";
import {
  useCreateCertification,
  useUpdateCertification,
} from "@/client/services/api/certifications";
import type { CertificationCreateDTO, CertificationDTO } from "@/shared/dto";
import type { CertificationFormValues } from "./models/certification-form.model";
import {
  getCertificationFieldValidators,
  getCertificationFormSchema,
} from "./models/certification-form.model";

export function CertificationFormComponent({ cert }: { cert?: CertificationDTO | null }) {
  const createCertification = useCreateCertification();
  const updateCertification = useUpdateCertification();
  const { t } = useClientTranslation();
  const fieldValidators = getCertificationFieldValidators(t);
  const form = useForm({
    defaultValues: {
      name: cert?.name || "",
      issuer: cert?.issuer || "",
      date: cert?.date ? new Date(cert.date).toISOString().split("T")[0] : "",
      url: cert?.url || "",
      userId: cert?.userId || "",
    },
    onSubmit: async (props: { value: CertificationFormValues }) => {
      const { value: values } = props;
      const data: CertificationCreateDTO = {
        name: values.name,
        issuer: values.issuer,
        date: new Date(values.date),
        url: values.url || null,
        userId: values.userId,
      };
      if (cert?.id) {
        await updateCertification.mutateAsync({ id: cert.id, data });
      } else {
        await createCertification.mutateAsync(data);
      }
    },
    validators: {
      onSubmit: getCertificationFormSchema(t),
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="name" validators={fieldValidators.name}>
        {(field) => (
          <AppInput
            label={t("admin.certifications.form.name")}
            field={field}
            placeholder={t("admin.certifications.form.name")}
          />
        )}
      </form.Field>
      <form.Field name="issuer" validators={fieldValidators.issuer}>
        {(field) => (
          <AppInput
            label={t("admin.certifications.form.issuer")}
            field={field}
            placeholder={t("admin.certifications.form.issuer")}
          />
        )}
      </form.Field>
      <form.Field name="date" validators={fieldValidators.date}>
        {(field) => (
          <AppInput
            label={t("admin.certifications.form.date")}
            field={field}
            type="date"
            placeholder={t("admin.certifications.form.date")}
          />
        )}
      </form.Field>
      <form.Field name="url" validators={fieldValidators.url}>
        {(field) => (
          <AppInput
            label={t("admin.certifications.form.url")}
            field={field}
            placeholder={t("admin.certifications.form.url")}
          />
        )}
      </form.Field>
      <form.Field name="userId" validators={fieldValidators.userId}>
        {(field) => (
          <AppInput
            label={t("admin.certifications.form.userId")}
            field={field}
            placeholder={t("admin.certifications.form.userId")}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting || createCertification.isPending ? "Adding..." : "Add Certification"}
          </Button>
        )}
      </form.Subscribe>
      {createCertification.isError && (
        <div className="text-red-500 text-xs">{createCertification.error.message}</div>
      )}
      {createCertification.isSuccess && (
        <div className="text-green-600 text-xs">Certification added!</div>
      )}
    </form>
  );
}
