import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { Button } from "@/client/components/ui";
import {
  useCreateCertification,
  useUpdateCertification,
} from "@/client/services/api/certifications";
import type { CertificationCreateDTO, CertificationDTO } from "@/shared/dto";
import { FieldInfoComponent } from "./components/field-info.component";
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
        {(field) => (
          <div>
            <label htmlFor={field.name} className="mb-1 block font-medium text-sm">
              Name
            </label>
            <input
              id={field.name}
              name={field.name}
              placeholder="Name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <FieldInfoComponent field={field} />
          </div>
        )}
      </form.Field>
      <form.Field name="issuer">
        {(field) => (
          <div>
            <label htmlFor={field.name} className="mb-1 block font-medium text-sm">
              Issuer
            </label>
            <input
              id={field.name}
              name={field.name}
              placeholder="Issuer"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <FieldInfoComponent field={field} />
          </div>
        )}
      </form.Field>
      <form.Field name="date">
        {(field) => (
          <div>
            <label htmlFor={field.name} className="mb-1 block font-medium text-sm">
              Date
            </label>
            <input
              id={field.name}
              name={field.name}
              type="date"
              placeholder="Date"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <FieldInfoComponent field={field} />
          </div>
        )}
      </form.Field>
      <form.Field name="url">
        {(field) => (
          <div>
            <label htmlFor={field.name} className="mb-1 block font-medium text-sm">
              URL
            </label>
            <input
              id={field.name}
              name={field.name}
              placeholder="URL"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <FieldInfoComponent field={field} />
          </div>
        )}
      </form.Field>
      <form.Field name="userId">
        {(field) => (
          <div>
            <label htmlFor={field.name} className="mb-1 block font-medium text-sm">
              User ID
            </label>
            <input
              id={field.name}
              name={field.name}
              placeholder="User ID"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <FieldInfoComponent field={field} />
          </div>
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
