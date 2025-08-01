import { type ColumnDef, flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { Check, ChevronDown, Eye, EyeClosed, Lock, Trash } from "lucide-react";
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
import { useAppTable } from "./app-table.hook";

interface AppTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onDeleteMultiple: (items: T[]) => void;
}

export function AppTable<T>({ data, columns, onDeleteMultiple }: AppTableProps<T>) {
  const { pageSize, page, pageSizeOptions, handlePageChange, handleItemsPerPage, t, table } =
    useAppTable<T>({ data, columns });

  return (
    <>
      <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
        <Input
          placeholder={t("search")}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
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
                    onDeleteMultiple(table.getSelectedRowModel().rows.map((row) => row.original)),
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
                .filter((column) => column.getCanHide())
                .map((column) => ({
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
          <Table className="rounded-md border border-border bg-card text-card-foreground shadow-sm">
            <TableHeader className="bg-muted text-muted-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-muted text-muted-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-accent/60"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="border-border">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
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
        dataLength={table.getFilteredRowModel().rows.length}
        pageSizeOptions={pageSizeOptions}
        onPageChange={handlePageChange}
        onPageSizeChange={handleItemsPerPage}
        t={t}
      />
    </>
  );
}
