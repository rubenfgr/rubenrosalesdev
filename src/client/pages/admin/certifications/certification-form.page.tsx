import { useParams } from "@tanstack/react-router";
import * as React from "react";
import { useGetCertification } from "@/client/services/api/certifications";
import { CertificationFormComponent } from "./components/certification-form/certification-form.component";

export default function CertificationFormPage() {
  const params = useParams({ from: "/admin/certifications/$id" });
  const id = params.id || "new";

  const { data: cert, isLoading, error } = useGetCertification(id);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;

  return (
    <div>
      <h2 className="mb-4 font-semibold text-xl">Editar Certificación</h2>
      <CertificationFormComponent cert={cert} />
    </div>
  );
}
