import { ChevronDown } from "lucide-react";
import type { FC } from "react";
import { AppButton } from "@/client/components/app-button/app-button.component";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/client/components/ui";
import type { AppSelectProps } from "./app-select.model";

export const AppSelect: FC<AppSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  t,
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger asChild>
      <AppButton
        className="w-full justify-between"
        variant="outline"
        label={value || placeholder}
        iconRight={<ChevronDown />}
      />
    </SelectTrigger>
    <SelectContent>
      {options.map((opt) => (
        <SelectItem key={opt} value={String(opt)}>
          {opt} / {t("page")}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
