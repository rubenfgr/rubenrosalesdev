import {
    type ColumnDef,
    type ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useClientTranslation } from "~/client/hooks";

export interface AppTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
}

export const useAppTable = <T>({ data, columns
}: AppTableProps<T>) => {
    const pageSizeOptions = [5, 10, 20, 50];
    const [pageSize, setPageSize] = React.useState(pageSizeOptions[1]);
    const [page, setPage] = React.useState(0);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    const { t } = useClientTranslation();

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: page,
                pageSize,
            },
        },
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleItemsPerPage = (value: string) => {
        const newSize = Number(value);
        setPageSize(newSize);
        setPage(0);
    };

    return {
        table,
        handleItemsPerPage,
        handlePageChange,
        page,
        pageSize,
        pageSizeOptions,
        t,
    };
};
