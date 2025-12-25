import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowRight } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
  comingSoon?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function PagePlaceholderComponent({
  title,
  description,
  icon: Icon,
  features,
  comingSoon = true,
  actionLabel,
  onAction,
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-semibold text-3xl">{title}</h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      {comingSoon && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Próximamente</AlertTitle>
          <AlertDescription>
            Esta funcionalidad está actualmente en desarrollo y estará disponible próximamente.
          </AlertDescription>
        </Alert>
      )}

      {features && features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              Funcionalidades planeadas
            </CardTitle>
            <CardDescription>
              Estas son algunas de las características que estarán disponibles en esta sección:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {actionLabel && onAction && (
        <div className="flex justify-start">
          <Button onClick={onAction} variant="outline">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
