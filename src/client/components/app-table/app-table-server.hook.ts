import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

interface UseAppTableServerProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
}

export function useAppTableServer<T>({ data, columns }: UseAppTableServerProps<T>) {
  const { t } = useTranslation();
  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    // No pagination state here, handled by parent
  });
  return { t, table };
}
