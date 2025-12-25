import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Brain, Cpu, FolderKanban, Rss, ShieldCheck, UserCircle2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/client/components/ui";

export const Route = createFileRoute("/admin/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Certificaciones",
      description: "Gestiona tus certificaciones profesionales",
      icon: ShieldCheck,
      url: "/admin/certifications",
      implemented: true,
    },
    {
      title: "Blog",
      description: "Gestiona tus publicaciones del blog",
      icon: Rss,
      url: "/admin/blog",
      implemented: false,
    },
    {
      title: "Proyectos",
      description: "Gestiona tu portafolio de proyectos",
      icon: FolderKanban,
      url: "/admin/projects",
      implemented: false,
    },
    {
      title: "Experiencia",
      description: "Gestiona tu experiencia laboral",
      icon: Brain,
      url: "/admin/experience",
      implemented: false,
    },
    {
      title: "Pila Tecnológica",
      description: "Gestiona tus habilidades técnicas",
      icon: Cpu,
      url: "/admin/techstack",
      implemented: false,
    },
    {
      title: "Perfil",
      description: "Gestiona tu información de perfil",
      icon: UserCircle2,
      url: "/admin/profile",
      implemented: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-semibold text-3xl">Panel de Control</h2>
        <p className="mt-2 text-muted-foreground">
          Bienvenido al panel de administración de tu portafolio. Aquí puedes gestionar todo tu
          contenido.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.url}
              className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
              onClick={() => navigate({ to: section.url })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {section.title}
                  {section.implemented && (
                    <span className="ml-auto rounded bg-green-500/10 px-2 py-0.5 font-medium text-green-700 text-xs dark:text-green-400">
                      Activo
                    </span>
                  )}
                  {!section.implemented && (
                    <span className="ml-auto rounded bg-yellow-500/10 px-2 py-0.5 font-medium text-xs text-yellow-700 dark:text-yellow-400">
                      Próximamente
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
