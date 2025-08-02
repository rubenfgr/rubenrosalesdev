import { useForm } from "@tanstack/react-form";
import { AppInput } from "@/client/components/app-input/app-input.component";
import { Button } from "@/client/components/ui";
import {
  useCreateCertification,
  useUpdateCertification,
} from "@/client/services/api/certifications";
import type { CertificationCreateDTO, CertificationDTO } from "@/shared/dto";
import {
  type CertificationFormValues,
  certificationFormSchema,
} from "./models/certification-form.model";

export function CertificationFormComponent({ cert }: { cert?: CertificationDTO | null }) {
  const createCertification = useCreateCertification();
  const updateCertification = useUpdateCertification();
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
      onChange: certificationFormSchema,
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
      <form.Field name="name">
        {(field) => <AppInput label="Name" field={field} placeholder="Name" />}
      </form.Field>
      <form.Field name="issuer">
        {(field) => <AppInput label="Issuer" field={field} placeholder="Issuer" />}
      </form.Field>
      <form.Field name="date">
        {(field) => <AppInput label="Date" field={field} type="date" placeholder="Date" />}
      </form.Field>
      <form.Field name="url">
        {(field) => <AppInput label="URL" field={field} placeholder="URL" />}
      </form.Field>
      <form.Field name="userId">
        {(field) => <AppInput label="User ID" field={field} placeholder="User ID" />}
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
