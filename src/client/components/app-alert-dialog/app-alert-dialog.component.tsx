import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@/client/components/ui";
import { useClientTranslation } from "~/client/hooks";
import type { AppAlertDialogComponentProps } from "./app-alert-dialog.model";

export const AppAlertDialogComponent = (props: AppAlertDialogComponentProps) => {
  const { t } = useClientTranslation();

  return (
    <AlertDialog open={props.isOpen}>
      {props.withTrigger && (
        <AlertDialogTrigger asChild>
          <Button variant="outline">{t(props.triggerText ?? "showAlert")}</Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title ?? "---"}</AlertDialogTitle>
          <AlertDialogDescription>{props.description ?? "---"}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={props.onCancel}>
            {t(props.cancelText ?? "cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={props.onConfirm}>
            {t(props.confirmText ?? "continue")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
