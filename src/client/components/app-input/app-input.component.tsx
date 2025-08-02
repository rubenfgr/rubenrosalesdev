import type { FieldApi } from "@tanstack/react-form";
import type { InputHTMLAttributes } from "react";
import { Input, Label } from "@/client/components/ui";

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  field?: FieldApi<unknown, string, unknown>;
}

export function AppInput({ label, field, ...props }: AppInputProps) {
  if (label && field) {
    return (
      <div>
        <Label htmlFor={field.name} className="mb-1 block font-medium text-sm">
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
          {...props}
        />
        {field.state.meta.touchedErrors ? (
          <div className="mt-1 font-medium text-red-500 text-xs">
            {field.state.meta.touchedErrors}
          </div>
        ) : field.state.meta.errors ? (
          <div className="mt-1 font-medium text-red-500 text-xs">
            {Array.isArray(field.state.meta.errors)
              ? field.state.meta.errors
                  .map((e: { message: string } | null) =>
                    typeof e === "object" && e !== null && "message" in e ? e.message : String(e),
                  )
                  .join(", ")
              : typeof field.state.meta.errors === "string"
                ? field.state.meta.errors
                : typeof field.state.meta.errors === "object" && field.state.meta.errors !== null
                  ? "message" in field.state.meta.errors
                    ? (field.state.meta.errors as { message: string }).message
                    : // biome-ignore lint/suspicious/noExplicitAny: any
                      Array.isArray((field.state.meta.errors as any).errors) &&
                        // biome-ignore lint/suspicious/noExplicitAny: any
                        (field.state.meta.errors as any).errors.length > 0 &&
                        // biome-ignore lint/suspicious/noExplicitAny: any
                        typeof (field.state.meta.errors as any).errors[0].message === "string"
                      ? // biome-ignore lint/suspicious/noExplicitAny: any
                        (field.state.meta.errors as any).errors[0].message
                      : JSON.stringify(field.state.meta.errors)
                  : String(field.state.meta.errors)}
          </div>
        ) : null}
      </div>
    );
  }

  return <Input autoComplete="off" spellCheck={false} {...props} />;
}
