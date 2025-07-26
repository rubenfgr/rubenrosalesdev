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
import type { CertificationDTO } from "@/shared/dto";
import { useClientTranslation } from "~/client/hooks";

interface UseCertificationsListArgs {
    data: CertificationDTO[];
    columns: ColumnDef<CertificationDTO>[];
    onDeleteMultiple: (certs: CertificationDTO[]) => void;
}

export const useCertificationsList = ({
    data,
    columns,
    onDeleteMultiple,
}: UseCertificationsListArgs) => {
    const pageSizeOptions = [5, 10, 20, 50];
    const [pageSize, setPageSize] = React.useState(pageSizeOptions[1]);
    const [page, setPage] = React.useState(0);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    const { t } = useClientTranslation();

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleItemsPerPage = (value: string) => {
        const newSize = Number(value);
        setPageSize(newSize);
        setPage(0);
    };

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

    const handleDeleteMultiple = () => {
        const selectedCerts = table.getSelectedRowModel().rows.map((row) => row.original);
        if (selectedCerts.length > 0) {
            onDeleteMultiple(selectedCerts);
        }
    };

    return {
        pageSize,
        page,
        pageSizeOptions,
        handlePageChange,
        handleItemsPerPage,
        table,
        handleDeleteMultiple,
        t
    };
}
