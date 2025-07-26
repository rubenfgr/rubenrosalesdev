import type { ReactNode } from "react";

export type AppIconButtonColor = "red" | "blue" | "gray";

export interface AppIconButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon: ReactNode;
  color: AppIconButtonColor;
}
