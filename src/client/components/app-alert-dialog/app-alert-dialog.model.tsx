export interface AppAlertDialogComponentProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  isLoading?: boolean;
  withTrigger?: boolean;
  triggerText?: string;
}
