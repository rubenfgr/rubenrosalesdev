import { cn } from "~/client/utils";
import { Button } from "../ui";
import { useAppIconButton } from "./app-icon-button.hook";
import type { AppIconButtonProps } from "./app-icon-button.model";

export const AppIconButton = (props: AppIconButtonProps) => {
  const { handleClick, getClassesByColor } = useAppIconButton(props);

  return (
    <Button
      variant="secondary"
      size={"icon"}
      onClick={handleClick}
      className={cn(
        "!cursor-pointer bg-transparent shadow-none",
        props.className || "",
        "hover:border hover:bg-transparent",
        getClassesByColor(props.color || "gray"),
      )}
    >
      {props.icon}
    </Button>
  );
};
