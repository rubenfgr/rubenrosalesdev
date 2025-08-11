import type { ColumnDef } from "@tanstack/react-table";

export interface AppTableServerProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onDeleteMultiple: (items: T[]) => void;
    isLoading?: boolean;
    onFilterChange?: (filter: string) => void;
    filterValue?: string;
}

export interface UseAppTableServerProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    onDeleteMultiple: (items: T[]) => void;
}
