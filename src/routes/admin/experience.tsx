import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { PagePlaceholderComponent } from "@/client/components/page-placeholder";

export const Route = createFileRoute("/admin/experience")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PagePlaceholderComponent
      title="Experiencia Laboral"
      description="Gestiona tu historial de experiencia profesional. Documenta tu trayectoria laboral y logros."
      icon={Brain}
      features={[
        "Agregar y editar experiencias laborales",
        "Especificar empresa, puesto y período de trabajo",
        "Describir responsabilidades y logros",
        "Asociar tecnologías utilizadas en cada posición",
        "Ordenar cronológicamente las experiencias",
        "Indicar si es el trabajo actual",
        "Agregar logros medibles y resultados",
      ]}
    />
  );
}
