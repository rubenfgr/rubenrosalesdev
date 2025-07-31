import { type ColumnDef, flexRender } from "@tanstack/react-table";
import { ChevronDown, Eye, EyeClosed, Trash } from "lucide-react";
import { AppPagination } from "@/client/components/app-pagination/app-pagination.component";
import {
  Input,
  ScrollArea,
  ScrollBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui";
import { AppDropdownMenu } from "../app-dropdown-menu/app-dropdown-menu.component";
import { useAppTableServer } from "./app-table-server.hook";

interface AppTableServerProps<T> {
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

export function AppTableServer<T>({
  columns,
  data,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onDeleteMultiple,
  isLoading = false,
  onFilterChange,
  filterValue = "",
}: AppTableServerProps<T>) {
  const { t, table } = useAppTableServer<T>({ data, columns });

  return (
    <>
      <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
        <Input
          placeholder={t("search")}
          value={filterValue}
          onChange={(event) => onFilterChange?.(event.target.value)}
        />
        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="w-1/2 md:w-auto">
            <AppDropdownMenu
              buttonLabel={t("actions")}
              buttonClassName="w-full"
              buttonVariant="outline"
              buttonIconRight={<ChevronDown />}
              disabled={table.getSelectedRowModel().rows.length === 0}
              items={[
                {
                  label: t("admin.certifications.deleteMultiple"),
                  icon: <Trash className="text-red-500" />,
                  onClick: () =>
                    onDeleteMultiple(
                      table.getSelectedRowModel().rows.map((row: { original: T }) => row.original),
                    ),
                },
              ]}
            />
          </div>
          <div className="w-1/2 md:w-auto">
            <AppDropdownMenu
              buttonLabel={t("columns")}
              buttonClassName="w-full"
              buttonVariant="outline"
              buttonIconRight={<ChevronDown />}
              items={table
                .getAllColumns()
                .filter((column: import("@tanstack/react-table").Column<T, unknown>) =>
                  column.getCanHide(),
                )
                .map((column: import("@tanstack/react-table").Column<T, unknown>) => ({
                  label: String(column.id),
                  onClick: () => column.toggleVisibility(),
                  className: "capitalize",
                  icon: column.getIsVisible() ? <Eye className="text-blue-500" /> : <EyeClosed />,
                }))}
            />
          </div>
        </div>
      </div>
      <ScrollArea className="w-[500px] min-w-full max-w-full overflow-x-auto">
        <div className="w-full">
          <Table>
            <TableHeader>
              {table
                .getHeaderGroups()
                .map((headerGroup: import("@tanstack/react-table").HeaderGroup<T>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(
                      (header: import("@tanstack/react-table").Header<T, unknown>) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {t("loading")}
                  </TableCell>
                </TableRow>
              ) : data.length ? (
                table.getRowModel().rows.map((row: import("@tanstack/react-table").Row<T>) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row
                      .getVisibleCells()
                      .map((cell: import("@tanstack/react-table").Cell<T, unknown>) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <AppPagination
        page={page}
        pageSize={pageSize}
        dataLength={total}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={onPageChange}
        onPageSizeChange={(size: string) => onPageSizeChange(Number(size))}
        t={t}
      />
    </>
  );
}
