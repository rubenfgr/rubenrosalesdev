import type { ColumnDef } from "@tanstack/react-table";

export interface AppTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    onDeleteMultiple: (items: T[]) => void;
}

