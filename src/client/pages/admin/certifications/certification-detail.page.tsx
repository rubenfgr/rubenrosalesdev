import { useParams } from "@tanstack/react-router";
import * as React from "react";
import { useGetCertification } from "@/client/services/api/certifications";
import { CertificationFormComponent } from "./components/certification-form.tsx/certification-form.component";

// Ajusta el tipo de los params según tu router
export default function CertificationDetailPage() {
  const params = useParams({ from: "/admin/certifications/$id" });
  const id = params.id || "";
  console.log("ID de la certificación:", id);
  const { data: cert, isLoading, error } = useGetCertification(id);

  if (!id) return <div>Falta el ID de la certificación.</div>;
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;
  if (!cert) return <div>No encontrada</div>;

  return (
    <div>
      <h2 className="mb-4 font-semibold text-xl">Editar Certificación</h2>
      <CertificationFormComponent cert={cert} />
    </div>
  );
}
