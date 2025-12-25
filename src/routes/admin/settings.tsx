import { createFileRoute } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";
import { PagePlaceholderComponent } from "@/client/components/page-placeholder";

export const Route = createFileRoute("/admin/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PagePlaceholderComponent
      title="Configuraciones"
      description="Configura las preferencias de la aplicación. Personaliza tu experiencia de usuario."
      icon={Settings2}
      features={[
        "Configuración de tema (claro/oscuro)",
        "Preferencias de idioma",
        "Configuración de notificaciones",
        "Gestión de seguridad y privacidad",
        "Configuración de SEO y metadatos",
        "Integración con servicios externos",
        "Configuración de respaldos y exportación de datos",
      ]}
    />
  );
}
