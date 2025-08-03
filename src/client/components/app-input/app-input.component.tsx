import type { FieldApi, FormApi } from "@tanstack/react-form";
import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import { Input, Label } from "@/client/components/ui";
import { cn } from "@/client/utils";

// Helper function to extract error message from TanStack Form field errors
function getErrorMessage(errors: unknown): string {
  if (!errors) return "";
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) {
    return errors
      .map((e) =>
        typeof e === "object" && e !== null && "message" in e
          ? (e as { message: string }).message
          : String(e),
      )
      .join(", ");
  }
  if (typeof errors === "object" && errors !== null) {
    if ("message" in errors) {
      return (errors as { message: string }).message;
    }
    // Handle nested Zod error structures
    if ("errors" in errors && Array.isArray((errors as any).errors)) {
      const nested = (errors as any).errors;
      if (nested.length > 0 && typeof nested[0]?.message === "string") {
        return nested[0].message;
      }
    }
  }
  return String(errors);
}

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  field?: FieldApi<unknown, string, unknown>;
  // For FormField integration
  // biome-ignore lint/suspicious/noExplicitAny: FormAPI generic type
  form?: FormApi<any, any>;
  fieldName?: string;
  // biome-ignore lint/suspicious/noExplicitAny: validators type
  validators?: any;
}

export function AppInput({
  label,
  error,
  hint,
  field,
  form,
  fieldName,
  validators,
  className,
  ...props
}: AppInputProps) {
  const inputId = useId();

  // If form and fieldName are provided, create a FormField
  if (form && fieldName && label) {
    return (
      <form.Field name={fieldName} validators={validators}>
        {(field) => {
          const rawError = field.state.meta.touchedErrors || field.state.meta.errors;
          const errorMessage = getErrorMessage(rawError);

          return (
            <div className="space-y-1">
              <Label htmlFor={field.name} className="block font-medium text-sm">
                {label}
              </Label>
              <Input
                autoComplete="off"
                spellCheck={false}
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={cn(errorMessage && "border-red-500", className)}
                {...props}
              />
              {errorMessage && (
                <p className="text-red-600 text-sm" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>
          );
        }}
      </form.Field>
    );
  }

  // If field is provided directly (legacy mode)
  if (label && field) {
    const rawError = field.state.meta.touchedErrors || field.state.meta.errors;
    const errorMessage = getErrorMessage(rawError);

    return (
      <div className="space-y-1">
        <Label htmlFor={field.name} className="block font-medium text-sm">
          {label}
        </Label>
        <Input
          autoComplete="off"
          spellCheck={false}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className={cn(errorMessage && "border-red-500", className)}
          {...props}
        />
        {errorMessage && (
          <p className="text-red-600 text-sm" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // Standalone input with optional error/hint
  if (label) {
    return (
      <div className="space-y-1">
        <Label htmlFor={inputId} className="block font-medium text-sm">
          {label}
        </Label>
        <Input
          id={inputId}
          autoComplete="off"
          spellCheck={false}
          className={cn(error && "border-red-500", className)}
          {...props}
        />
        {error && (
          <p className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-gray-600 text-sm">{hint}</p>}
      </div>
    );
  }

  // Basic input without label
  return <Input autoComplete="off" spellCheck={false} className={className} {...props} />;
}
