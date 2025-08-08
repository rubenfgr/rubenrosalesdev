import * as React from "react";
import { cn } from "~/client/utils";
import { Button } from "../ui";
import type { AppButtonProps } from "./app-button.model";

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>((props, ref) => {
  const { iconLeft, iconRight, label, ...buttonProps } = props;

  const variant = buttonProps.variant || "default";
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonProps.onClick) {
      buttonProps.onClick(e);
    }
  };

  return (
    <Button
      ref={ref}
      disabled={buttonProps.disabled}
      size={"default"}
      variant={variant}
      onClick={handleClick}
      className={cn("!cursor-pointer", buttonProps.className || "")}
      {...buttonProps}
    >
      <span className="flex items-center gap-2">
        {!!iconLeft && iconLeft}
        {label}
        {!!iconRight && iconRight}
      </span>
    </Button>
  );
});
AppButton.displayName = "AppButton";
