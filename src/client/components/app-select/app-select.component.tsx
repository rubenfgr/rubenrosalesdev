import { SelectValue } from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type { FC } from "react";
import { AppButton } from "@/client/components/app-button/app-button.component";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/client/components/ui";
import { useClientTranslation } from "~/client/hooks";
import type { AppSelectProps } from "./app-select.model";

export const AppSelect: FC<AppSelectProps> = ({ value, onValueChange, options, placeholder }) => {
  const { t } = useClientTranslation();

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={String(opt)}>
            <span>
              {opt} / {t("page")}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
