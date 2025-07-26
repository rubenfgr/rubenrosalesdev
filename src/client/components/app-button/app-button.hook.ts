import type { AppButtonProps } from "./app-button.model";

export const useAppButton = (props: AppButtonProps) => {
    const variant = props.variant || "outline";

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.onClick?.(event);
    };

    return {
        variant,
        handleClick,
    };
};
