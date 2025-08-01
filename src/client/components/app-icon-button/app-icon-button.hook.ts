import type { AppIconButtonColor, AppIconButtonProps } from "./app-icon-button.model";

export const useAppIconButton = (props: AppIconButtonProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);
  };

  const getClassesByColor = (color: AppIconButtonColor) => {
    switch (color) {
      case "red":
        return "text-red-500 border-red-500";
      case "blue":
        return "text-blue-500 border-blue-500";
      case "gray":
        return "text-gray-500 border-gray-500";
      default:
        return "text-gray-500 border-gray-500";
    }
  };

  return {
    handleClick,
    getClassesByColor,
  };
};
