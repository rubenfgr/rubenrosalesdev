import type { FormApi } from "@tanstack/react-form";
import type { InputHTMLAttributes } from "react";
import { AppInput } from "@/client/components/app-input/app-input.component";

export interface AppFormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  label: string;
  // biome-ignore lint/suspicious/noExplicitAny: Form validators type
  validators?: any;
}

/**
 * Extract error message from Zod or other error shapes.
 */
function getErrorMessage(errors: unknown): string {
  if (!errors) return "";
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) {
    return errors
      .map((e) =>
        typeof e === "object" && e !== null && "message" in e ? (e as any).message : String(e),
      )
      .join(", ");
  }
  if (typeof errors === "object" && errors !== null) {
    if ("message" in errors) {
      return (errors as any).message;
    }
    if ("errors" in errors && Array.isArray((errors as any).errors)) {
      const nested = (errors as any).errors;
      if (nested.length > 0 && typeof nested[0]?.message === "string") {
        return nested[0].message;
      }
    }
  }
  return String(errors);
}
export function createAppFormField(props: AppFormFieldProps) {
  const { name, label, validators, ...inputProps } = props;

  return {
    name,
    validators,
    // Field render: show input and consolidated error message
    // biome-ignore lint/suspicious/noExplicitAny: Field API generic type
    children: (field: any) => {
      const rawError = field.state.meta.touchedErrors || field.state.meta.errors;
      const error = getErrorMessage(rawError);
      return (
        <AppInput label={label} field={field} placeholder={label} error={error} {...inputProps} />
      );
    },
  };
}
