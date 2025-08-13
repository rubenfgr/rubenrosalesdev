import type { ReactNode } from "react";

export interface AppIconButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon: ReactNode;
}
