import { createFileRoute } from "@tanstack/react-router";
import { Book, HelpCircle, Mail, MessageCircle } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui";

export const Route = createFileRoute("/admin/help")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-semibold text-3xl">Obtener Ayuda</h2>
        <p className="mt-2 text-muted-foreground">
          Encuentra recursos y soporte para ayudarte a usar esta aplicación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Documentación
            </CardTitle>
            <CardDescription>
              Consulta guías y tutoriales sobre cómo usar todas las funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Ver Documentación
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Preguntas Frecuentes
            </CardTitle>
            <CardDescription>Encuentra respuestas a las preguntas más comunes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Ver FAQ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contacto
            </CardTitle>
            <CardDescription>¿Necesitas ayuda adicional? Contáctanos directamente</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("mailto:rubenfranciscogr@outlook.com")}
            >
              Enviar Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Guía Rápida
            </CardTitle>
            <CardDescription>Primeros pasos con la aplicación</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Usa el menú lateral para navegar entre secciones</li>
              <li>• Las certificaciones ya están disponibles para gestionar</li>
              <li>• Otras secciones estarán disponibles próximamente</li>
              <li>• Usa el botón de tema para cambiar entre modo claro/oscuro</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acerca de esta Aplicación</CardTitle>
          <CardDescription>
            Sistema de gestión de portafolio construido con TanStack Router y React
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              Esta aplicación te permite gestionar tu portafolio profesional, incluyendo
              certificaciones, proyectos, experiencia laboral, habilidades técnicas y más.
            </p>
            <p className="text-muted-foreground">
              Desarrollado con tecnologías modernas: React 19, TanStack Router, Prisma, y Tailwind
              CSS.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
