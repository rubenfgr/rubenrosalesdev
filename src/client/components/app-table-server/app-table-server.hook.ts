import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useClientTranslation } from "@/client/hooks";
import type { UseAppTableServerProps } from "./app-table-server.model";

export function useAppTableServer<T>({
  data,
  columns,
  onDeleteMultiple,
}: UseAppTableServerProps<T>) {
  const { t } = useClientTranslation();
  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
  });

  const handleDeleteMultiple = () => {
    const selectedOriginal = table
      .getSelectedRowModel()
      .rows.map((row: { original: T }) => row.original);
    onDeleteMultiple(selectedOriginal);
    table.resetRowSelection();
  };

  return { t, table, handleDeleteMultiple };
}
