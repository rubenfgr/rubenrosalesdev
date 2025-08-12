import type { AnyFieldApi } from "@tanstack/react-form";
import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";
import {
  Button,
  Calendar,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui";
import { cn } from "@/client/utils";
import getErrorMessage from "@/shared/utils/get-error-message.util";

export interface AppDatepickerProps {
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
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

export function AppDatepicker({
  value,
  onValueChange,
  placeholder = "Select date",
  disabled = false,
  className,
  label,
  error,
  hint,
  field,
  form,
  fieldName,
  validators,
}: AppDatepickerProps) {
  const [open, setOpen] = useState(false);
  const datepickerId = useId();

  // If form and fieldName are provided, create a FormField
  if (form && fieldName && label) {
    return (
      <form.Field name={fieldName} validators={validators}>
        {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form field callback has implicit any type */}
        {(field: any) => {
          const rawError = field.state.meta.touchedErrors || field.state.meta.errors;
          const errorMessage = getErrorMessage(rawError);
          const fieldValue = field.state.value as Date | undefined;

          return (
            <div className="space-y-1">
              <Label htmlFor={field.name} className="block font-medium text-sm">
                {label}
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id={field.name}
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between font-normal",
                      !fieldValue && "text-muted-foreground",
                      errorMessage && "border-red-500",
                      className,
                    )}
                    onBlur={field.handleBlur}
                  >
                    {fieldValue ? fieldValue.toLocaleDateString() : placeholder}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto min-w-[240px] overflow-hidden p-0" align="start">
                  <Calendar
                    style={{ width: "100%" }}
                    mode="single"
                    selected={fieldValue}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      field.handleChange(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
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

  // Datepicker connected to TanStack Form field (legacy mode)
  if (field && label) {
    const errorMessage =
      field.state.meta.isTouched && !field.state.meta.isValid
        ? getErrorMessage(field.state.meta.errors)
        : "";
    const fieldValue = field.state.value as Date | undefined;

    return (
      <div className="space-y-1">
        <Label htmlFor={field.name} className="block font-medium text-sm">
          {label}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id={field.name}
              disabled={disabled}
              className={cn(
                "w-full justify-between font-normal",
                !fieldValue && "text-muted-foreground",
                errorMessage && "border-red-500",
                className,
              )}
              onBlur={field.handleBlur}
            >
              {fieldValue ? fieldValue.toLocaleDateString() : placeholder}
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto min-w-[240px] overflow-hidden p-0" align="start">
            <Calendar
              style={{ width: "100%" }}
              mode="single"
              selected={fieldValue}
              captionLayout="dropdown"
              onSelect={(date) => {
                field.handleChange(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        {errorMessage && (
          <p className="text-red-600 text-sm" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // Standalone datepicker with label
  if (label) {
    return (
      <div className="space-y-1">
        <Label htmlFor={datepickerId} className="block font-medium text-sm">
          {label}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id={datepickerId}
              disabled={disabled}
              className={cn(
                "w-full justify-between font-normal",
                !value && "text-muted-foreground",
                error && "border-red-500",
                className,
              )}
            >
              {value ? value.toLocaleDateString() : placeholder}
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto min-w-[240px] overflow-hidden p-0" align="start">
            <Calendar
              style={{ width: "100%" }}
              mode="single"
              selected={value}
              captionLayout="dropdown"
              onSelect={(date) => {
                onValueChange?.(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        {error && (
          <p className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-gray-600 text-sm">{hint}</p>}
      </div>
    );
  }

  // Basic datepicker without label
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          {value ? value.toLocaleDateString() : placeholder}
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[240px] overflow-hidden p-0" align="start">
        <Calendar
          style={{ width: "100%" }}
          mode="single"
          selected={value}
          captionLayout="dropdown"
          onSelect={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
