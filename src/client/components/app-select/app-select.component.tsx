import type { FieldApi, FormApi } from "@tanstack/react-form";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui";
import { cn } from "@/client/utils";
import { AppButton } from "../app-button/app-button.component";
import type { SelectOption } from "./app-select.model";

// Hook para detectar scroll infinito
const useInfiniteScroll = (onLoadMore: (() => void) | undefined, hasMore: boolean) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 1.0 },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [onLoadMore, hasMore]);

  return sentinelRef;
};

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
    if ("errors" in errors && Array.isArray((errors as { errors: unknown[] }).errors)) {
      const nested = (errors as { errors: unknown[] }).errors;
      if (
        nested.length > 0 &&
        typeof nested[0] === "object" &&
        nested[0] !== null &&
        "message" in nested[0]
      ) {
        return (nested[0] as { message: string }).message;
      }
    }
  }
  return String(errors);
}

export interface AppSelectProps<TValue = string> {
  value?: TValue;
  onValueChange?: (value: TValue) => void;
  options?: SelectOption<TValue>[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  loading?: boolean;
  onSearch?: (query: string) => void;
  emptyText?: string;
  className?: string;
  label?: string;
  error?: string;
  hint?: string;
  // Infinite scroll support
  hasMore?: boolean;
  onLoadMore?: () => void;
  // Field and form support with proper typing
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form types are complex
  field?: any;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form types are complex
  form?: any;
  fieldName?: string;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form validators type
  validators?: any;
}

export function AppSelect<TValue = string>({
  value,
  onValueChange,
  options = [],
  placeholder = "Select an option...",
  disabled = false,
  searchable = false,
  loading = false,
  onSearch,
  emptyText = "No options found",
  className,
  label,
  error,
  hint,
  hasMore = false,
  onLoadMore,
  field,
  form,
  fieldName,
  validators,
}: AppSelectProps<TValue>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectId = useId();

  // Hook para scroll infinito
  const sentinelRef = useInfiniteScroll(onLoadMore, hasMore);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery, searchable]);

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);

  // If form and fieldName are provided, create a FormField
  if (form && fieldName && label) {
    return (
      <form.Field name={fieldName} validators={validators}>
        {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form field callback has implicit any type */}
        {(field: any) => {
          const rawError = field.state.meta.touchedErrors || field.state.meta.errors;
          const errorMessage = getErrorMessage(rawError);
          const fieldValue = field.state.value as TValue;
          const fieldSelectedOption = options.find((opt) => opt.value === fieldValue);

          if (searchable) {
            return (
              <div className="space-y-1">
                <Label htmlFor={field.name} className="block font-medium text-sm">
                  {label}
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      id={field.name}
                      className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        errorMessage && "border-red-500",
                        className,
                      )}
                      disabled={disabled}
                      onBlur={field.handleBlur}
                    >
                      <span className={cn(!fieldSelectedOption && "text-muted-foreground")}>
                        {fieldSelectedOption?.label || placeholder}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search..."
                        value={searchQuery}
                        onValueChange={handleSearchChange}
                      />
                      <CommandList>
                        {loading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : filteredOptions.length === 0 ? (
                          <CommandEmpty>{emptyText}</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {filteredOptions.map((option) => (
                              <CommandItem
                                key={String(option.value)}
                                value={option.label}
                                onSelect={() => {
                                  field.handleChange(option.value);
                                  setOpen(false);
                                  setSearchQuery("");
                                }}
                                disabled={option.disabled}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    fieldValue === option.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                            {/* Sentinel element for infinite scroll */}
                            {hasMore && (
                              <div
                                ref={sentinelRef}
                                className="flex items-center justify-center py-2"
                              >
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="ml-2 text-muted-foreground text-sm">
                                  Loading more...
                                </span>
                              </div>
                            )}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
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

          // Non-searchable select for form integration
          return (
            <div className="space-y-1">
              <Label htmlFor={field.name} className="block font-medium text-sm">
                {label}
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <AppButton
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between",
                      errorMessage && "border-red-500",
                      className,
                    )}
                    variant={"outline"}
                    label={fieldSelectedOption?.label || placeholder}
                    iconRight={<ChevronDown className="h-4 w-4 opacity-50" />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command shouldFilter={false}>
                    <CommandList>
                      {loading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : options.length === 0 ? (
                        <CommandEmpty>{emptyText}</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {options.map((option) => (
                            <CommandItem
                              key={String(option.value)}
                              value={option.label}
                              onSelect={() => {
                                field.handleChange(option.value);
                                setOpen(false);
                              }}
                              disabled={option.disabled}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  fieldValue === option.value ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
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

  // If field is provided directly (legacy mode)
  if (label && field) {
    const rawError = field.state.meta.touchedErrors || field.state.meta.errors;
    const errorMessage = getErrorMessage(rawError);
    const fieldValue = field.state.value as TValue;
    const fieldSelectedOption = options.find((opt) => opt.value === fieldValue);

    if (searchable) {
      return (
        <div className="space-y-1">
          <Label htmlFor={field.name} className="block font-medium text-sm">
            {label}
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                id={field.name}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  errorMessage && "border-red-500",
                  className,
                )}
                disabled={disabled}
                onBlur={field.handleBlur}
              >
                <span className={cn(!fieldSelectedOption && "text-muted-foreground")}>
                  {fieldSelectedOption?.label || placeholder}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search..."
                  value={searchQuery}
                  onValueChange={handleSearchChange}
                />
                <CommandList>
                  {loading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : filteredOptions.length === 0 ? (
                    <CommandEmpty>{emptyText}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredOptions.map((option) => (
                        <CommandItem
                          key={String(option.value)}
                          value={option.label}
                          onSelect={() => {
                            field.handleChange(option.value);
                            setOpen(false);
                            setSearchQuery("");
                          }}
                          disabled={option.disabled}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              fieldValue === option.value ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                      {/* Sentinel element for infinite scroll */}
                      {hasMore && (
                        <div ref={sentinelRef} className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-muted-foreground text-sm">
                            Loading more...
                          </span>
                        </div>
                      )}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
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

    // Non-searchable select for legacy mode
    return (
      <div className="space-y-1">
        <Label htmlFor={field.name} className="block font-medium text-sm">
          {label}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <AppButton
              disabled={disabled}
              className={cn("w-full justify-between", errorMessage && "border-red-500", className)}
              variant={"outline"}
              label={fieldSelectedOption?.label || placeholder}
              iconRight={<ChevronDown className="h-4 w-4 opacity-50" />}
            />
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command shouldFilter={false}>
              <CommandList>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : options.length === 0 ? (
                  <CommandEmpty>{emptyText}</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={String(option.value)}
                        value={option.label}
                        onSelect={() => {
                          field.handleChange(option.value);
                          setOpen(false);
                        }}
                        disabled={option.disabled}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            fieldValue === option.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
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

  // Standalone select with optional error/hint
  if (label) {
    if (searchable) {
      return (
        <div className="space-y-1">
          <Label htmlFor={selectId} className="block font-medium text-sm">
            {label}
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                id={selectId}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  error && "border-red-500",
                  className,
                )}
                disabled={disabled}
              >
                <span className={cn(!selectedOption && "text-muted-foreground")}>
                  {selectedOption?.label || placeholder}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search..."
                  value={searchQuery}
                  onValueChange={handleSearchChange}
                />
                <CommandList>
                  {loading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : filteredOptions.length === 0 ? (
                    <CommandEmpty>{emptyText}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredOptions.map((option) => (
                        <CommandItem
                          key={String(option.value)}
                          value={option.label}
                          onSelect={() => {
                            onValueChange?.(option.value);
                            setOpen(false);
                            setSearchQuery("");
                          }}
                          disabled={option.disabled}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option.value ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                      {/* Sentinel element for infinite scroll */}
                      {hasMore && (
                        <div ref={sentinelRef} className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-muted-foreground text-sm">
                            Loading more...
                          </span>
                        </div>
                      )}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
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

    // Non-searchable standalone select
    return (
      <div className="space-y-1">
        <Label htmlFor={selectId} className="block font-medium text-sm">
          {label}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <AppButton
              disabled={disabled}
              className={cn("w-full justify-between", error && "border-red-500", className)}
              variant={"outline"}
              label={selectedOption?.label || placeholder}
              iconRight={<ChevronDown className="h-4 w-4 opacity-50" />}
            />
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command shouldFilter={false}>
              <CommandList>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : options.length === 0 ? (
                  <CommandEmpty>{emptyText}</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={String(option.value)}
                        value={option.label}
                        onSelect={() => {
                          onValueChange?.(option.value);
                          setOpen(false);
                        }}
                        disabled={option.disabled}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === option.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
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

  // Basic select without label - searchable
  if (searchable) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            disabled={disabled}
          >
            <span className={cn(!selectedOption && "text-muted-foreground")}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search..."
              value={searchQuery}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty>{emptyText}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={String(option.value)}
                      value={option.label}
                      onSelect={() => {
                        onValueChange?.(option.value);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      disabled={option.disabled}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                  {/* Sentinel element for infinite scroll */}
                  {hasMore && (
                    <div ref={sentinelRef} className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-muted-foreground text-sm">Loading more...</span>
                    </div>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Basic select without label - non-searchable
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <AppButton
          disabled={disabled}
          className={cn("w-full justify-between", className)}
          variant={"outline"}
          label={selectedOption?.label || placeholder}
          iconRight={<ChevronDown className="h-4 w-4 opacity-50" />}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    value={option.label}
                    onSelect={() => {
                      onValueChange?.(option.value);
                      setOpen(false);
                    }}
                    disabled={option.disabled}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
