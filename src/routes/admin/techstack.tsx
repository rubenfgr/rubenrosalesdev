import { createFileRoute } from "@tanstack/react-router";
import { Cpu } from "lucide-react";
import { PagePlaceholderComponent } from "@/client/components/page-placeholder";

export const Route = createFileRoute("/admin/techstack")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PagePlaceholderComponent
      title="Pila Tecnológica"
      description="Gestiona tus habilidades técnicas y herramientas. Muestra tu experiencia con diferentes tecnologías."
      icon={Cpu}
      features={[
        "Agregar y editar tecnologías",
        "Especificar nivel de habilidad (principiante, intermedio, avanzado)",
        "Categorizar por tipo (lenguajes, frameworks, herramientas, etc.)",
        "Asociar tecnologías con proyectos y experiencias",
        "Organizar por área de especialización",
        "Agregar iconos y logotipos de tecnologías",
        "Indicar años de experiencia con cada tecnología",
      ]}
    />
  );
}
