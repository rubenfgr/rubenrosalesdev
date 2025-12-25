import { createFileRoute } from "@tanstack/react-router";
import { UserCircle2 } from "lucide-react";
import { PagePlaceholderComponent } from "@/client/components/page-placeholder";

export const Route = createFileRoute("/admin/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PagePlaceholderComponent
      title="Perfil"
      description="Gestiona tu información de perfil personal. Actualiza tu biografía, foto y datos de contacto."
      icon={UserCircle2}
      features={[
        "Editar información personal (nombre, email, ubicación)",
        "Actualizar foto de perfil y avatar",
        "Escribir y editar biografía",
        "Agregar enlaces a redes sociales",
        "Especificar sitio web personal",
        "Configurar información de contacto",
        "Personalizar URL del portafolio",
      ]}
    />
  );
}
