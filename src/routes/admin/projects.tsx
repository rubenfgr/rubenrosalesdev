import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { PagePlaceholderComponent } from "@/client/components/page-placeholder";

export const Route = createFileRoute("/admin/projects")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PagePlaceholderComponent
      title="Proyectos"
      description="Gestiona tu portafolio de proyectos. Muestra tus trabajos más destacados y logros profesionales."
      icon={FolderKanban}
      features={[
        "Crear y editar proyectos",
        "Agregar descripciones detalladas y capturas de pantalla",
        "Asociar tecnologías utilizadas en cada proyecto",
        "Enlazar repositorios de GitHub o sitios web en vivo",
        "Organizar proyectos por categoría o estado",
        "Destacar proyectos principales",
        "Agregar fechas de inicio y finalización",
      ]}
    />
  );
}
