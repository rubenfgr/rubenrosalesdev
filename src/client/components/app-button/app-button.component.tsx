import * as React from "react";
import { cn } from "~/client/utils";
import { Button } from "../ui";
import { useAppButton } from "./app-button.hook";
import type { AppButtonProps } from "./app-button.model";

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>((props, ref) => {
  const { variant, handleClick } = useAppButton(props);

  return (
    <Button
      ref={ref}
      disabled={props.disabled}
      size={"default"}
      variant={variant}
      onClick={handleClick}
      className={cn(
        "!cursor-pointer",
        variant === "destructive" ? "bg-red-500 text-white hover:bg-red-600" : "",
        variant === "outline" ? "border border-gray-300 text-gray-700 hover:bg-gray-100" : "",
        variant === "default" ? "bg-blue-500 text-white hover:bg-blue-600" : "",
        props.className || "",
      )}
      {...props}
    >
      {!!props.iconLeft && props.iconLeft}
      {props.label}
      {!!props.iconRight && props.iconRight}
    </Button>
  );
});
AppButton.displayName = "AppButton";
