import type { ReactNode } from "react";

export interface AppDropdownMenuItem {
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  label: ReactNode;
}

export interface AppDropdownMenuProps {
  buttonLabel: ReactNode;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "destructive";
  buttonIconRight?: ReactNode;
  items: AppDropdownMenuItem[];
  align?: "start" | "center" | "end";
  disabled?: boolean;
}
