import type { FC } from "react";
import { AppButton } from "@/client/components/app-button/app-button.component";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui";
import type { AppDropdownMenuProps } from "./app-dropdown-menu.model";

export const AppDropdownMenu: FC<AppDropdownMenuProps> = ({
  buttonLabel,
  buttonClassName = "",
  buttonVariant = "outline",
  buttonIconRight,
  items,
  align = "end",
  disabled = false,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild disabled={disabled}>
      <AppButton
        className={`w-full justify-between ${buttonClassName}`}
        variant={buttonVariant}
        label={typeof buttonLabel === "string" ? buttonLabel : ""}
        iconRight={buttonIconRight}
      />
    </DropdownMenuTrigger>
    <DropdownMenuContent align={align}>
      {items.map((item, idx) => (
        <DropdownMenuItem key={idx} onClick={item.onClick} className={item.className}>
          {item.icon} {item.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
