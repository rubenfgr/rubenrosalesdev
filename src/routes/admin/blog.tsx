import { createFileRoute } from "@tanstack/react-router";
import { Rss } from "lucide-react";
import { PagePlaceholderComponent } from "@/client/components/page-placeholder";

export const Route = createFileRoute("/admin/blog")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PagePlaceholderComponent
      title="Publicaciones del Blog"
      description="Gestiona las publicaciones de tu blog. Crea, edita y publica artículos para compartir tus conocimientos y experiencias."
      icon={Rss}
      features={[
        "Crear y editar publicaciones del blog",
        "Administrar borradores y publicaciones publicadas",
        "Agregar etiquetas y categorías",
        "Editor de markdown con vista previa",
        "Gestión de imágenes y medios",
        "Programación de publicaciones",
        "Análisis de visualizaciones y métricas",
      ]}
    />
  );
}
