import type { ReactNode } from "react";

export interface AppButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  variant?: "default" | "outline" | "destructive";
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  disabled?: boolean;
}
