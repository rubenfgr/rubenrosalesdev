import { type ColumnDef, flexRender } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash } from "lucide-react";
import * as React from "react";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  ScrollArea,
  ScrollBar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui";
import type { CertificationDTO } from "@/shared/dto";
import { AppButton } from "~/client/components/app-button/app-button.component";
import { AppDropdownMenu } from "~/client/components/app-dropdown-menu/app-dropdown-menu.component";
import { AppIconButton } from "~/client/components/app-icon-button/app-icon-button.component";
import { useClientTranslation } from "~/client/hooks";
import { useCertificationsList } from "./certifications-list.hook";

export function CertificationsListComponent({
  data,
  onEdit,
  onDelete,
  onDeleteMultiple,
}: {
  data: CertificationDTO[];
  onEdit: (cert: CertificationDTO) => void;
  onDelete: (cert: CertificationDTO) => void;
  onDeleteMultiple: (certs: CertificationDTO[]) => void;
}) {
  const { t } = useClientTranslation();

  const columns = React.useMemo<ColumnDef<CertificationDTO>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-bold"
          >
            {t("admin.certifications.name")} <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span>{row.getValue("name")}</span>,
      },
      {
        accessorKey: "issuer",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-bold"
          >
            {t("admin.certifications.issuer")} <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span>{row.getValue("issuer")}</span>,
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-bold"
          >
            {t("admin.certifications.date")} <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) =>
          row.original.date ? new Date(row.original.date).toLocaleDateString() : "",
      },
      {
        accessorKey: "url",
        header: () => "URL",
        cell: ({ row }) =>
          row.original.url ? (
            <a
              href={row.original.url}
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("admin.certifications.link")}
            </a>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <AppIconButton color="blue" icon={<Edit />} onClick={() => onEdit(row.original)} />
            <AppIconButton color="red" icon={<Trash />} onClick={() => onDelete(row.original)} />
          </div>
        ),
      },
    ],
    [t, onEdit, onDelete],
  );

  const {
    pageSize,
    page,
    pageSizeOptions,
    handlePageChange,
    handleItemsPerPage,
    table,
    handleDeleteMultiple,
  } = useCertificationsList({ data, columns, onDeleteMultiple });

  return (
    <div className="flex max-w-full flex-col gap-3">
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
                  onClick: handleDeleteMultiple,
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
                  label: column.id,
                  onClick: () => column.toggleVisibility(),
                  className: "capitalize",
                }))}
            />
          </div>
        </div>
      </div>
      <ScrollArea className="w-[500px] min-w-full max-w-full overflow-x-auto">
        <div className="w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
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
      <div className="flex w-full flex-col-reverse items-center justify-between gap-3 md:flex-row">
        <div className="flex items-center gap-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 0) handlePageChange(page - 1);
                  }}
                  aria-disabled={page === 0}
                  tabIndex={page === 0 ? -1 : 0}
                >
                  <ChevronLeft />
                </PaginationLink>
              </PaginationItem>
              {Array.from({ length: Math.ceil(data.length / pageSize) }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={i === page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(i);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page + 1 < Math.ceil(data.length / pageSize)) handlePageChange(page + 1);
                  }}
                  aria-disabled={page + 1 >= Math.ceil(data.length / pageSize)}
                  tabIndex={page + 1 >= Math.ceil(data.length / pageSize) ? -1 : 0}
                >
                  <ChevronRight />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-nowrap text-muted-foreground text-sm">
            {t("results")}: {data.length}
          </span>
          <Select value={pageSize ? String(pageSize) : ""} onValueChange={handleItemsPerPage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("itemsPerPage")} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt} / {t("page")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
