import { useForm } from "@tanstack/react-form";
import { AppInput } from "@/client/components/app-input/app-input.component";
import { AppSelect } from "@/client/components/app-select";
import { Button } from "@/client/components/ui";
import { useClientTranslation, useUserSelect } from "@/client/hooks";
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

  // Hook for user selection with infinite scroll
  const userSelect = useUserSelect();
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
      onChange: getCertificationFormSchema(t),
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
            field={field}
            label={t("admin.certifications.form.name")}
            placeholder={t("admin.certifications.form.name")}
          />
        )}
      </form.Field>
      <form.Field name="issuer" validators={fieldValidators.issuer}>
        {(field) => (
          <AppInput
            field={field}
            label={t("admin.certifications.form.issuer")}
            placeholder={t("admin.certifications.form.issuer")}
          />
        )}
      </form.Field>
      <form.Field name="date" validators={fieldValidators.date}>
        {(field) => (
          <AppInput
            field={field}
            label={t("admin.certifications.form.date")}
            placeholder={t("admin.certifications.form.date")}
            type="date"
          />
        )}
      </form.Field>
      <form.Field name="url" validators={fieldValidators.url}>
        {(field) => (
          <AppInput
            field={field}
            label={t("admin.certifications.form.url")}
            placeholder={t("admin.certifications.form.url")}
          />
        )}
      </form.Field>
      <AppSelect
        form={form}
        fieldName="userId"
        label={t("admin.certifications.form.userId")}
        validators={fieldValidators.userId}
        placeholder={t("admin.certifications.form.userId.placeholder")}
        options={userSelect.options}
        searchable={true}
        loading={userSelect.isLoading}
        onSearch={userSelect.onSearch}
        hasMore={userSelect.hasMore}
        onLoadMore={userSelect.loadMore}
        emptyText={t("admin.certifications.form.userId.empty")}
      />
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isValid]}>
        {([canSubmit, isSubmitting, isValid]) => (
          <Button type="submit" disabled={!canSubmit || !isValid || isSubmitting}>
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
