import * as React from "react";
import { cn } from "~/client/utils";
import { Button } from "../ui";
import type { AppButtonProps } from "./app-button.model";

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>((props, ref) => {
  const { iconLeft, iconRight, label, ...buttonProps } = props;

  return (
    <Button
      ref={ref}
      disabled={buttonProps.disabled}
      size={"default"}
      className={cn(
        "!cursor-pointer",
        props.variant === "destructive" ? "bg-red-500 text-white hover:bg-red-600" : "",
        props.variant === "outline" ? "border border-gray-300 text-gray-700 hover:bg-gray-100" : "",
        props.variant === "default" ? "bg-blue-500 text-white hover:bg-blue-600" : "",
        buttonProps.className || "",
      )}
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
