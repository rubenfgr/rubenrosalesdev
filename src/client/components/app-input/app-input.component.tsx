import type { AnyFieldApi } from "@tanstack/react-form";
import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import { Input, Label } from "@/client/components/ui";
import { cn } from "@/client/utils";
import getErrorMessage from "@/shared/utils/get-error-message.util";

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  field?: AnyFieldApi;
  // Field and form support with proper typing
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form types are complex
  form?: any;
  fieldName?: string;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form validators type
  validators?: any;
}

export function AppInput({
  label,
  error,
  hint,
  field,
  className,
  form,
  fieldName,
  validators,
  ...props
}: AppInputProps) {
  const inputId = useId();

  // If form and fieldName are provided, create a FormField
  if (form && fieldName && label) {
    return (
      <form.Field name={fieldName} validators={validators}>
        {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form field callback has implicit any type */}
        {(field: any) => {
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
                value={field.state.value || ""}
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

  // Input connected to TanStack Form field (legacy mode)
  if (field && label) {
    const errorMessage =
      field.state.meta.isTouched && !field.state.meta.isValid
        ? getErrorMessage(field.state.meta.errors)
        : "";

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
          value={field.state.value || ""}
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

  // Standalone input with label
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
