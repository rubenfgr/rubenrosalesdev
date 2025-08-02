import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useClientTranslation } from "@/client/hooks";

interface UseAppTableServerProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
}

export function useAppTableServer<T>({ data, columns }: UseAppTableServerProps<T>) {
  const { t } = useClientTranslation();
  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
  });
  return { t, table };
}
