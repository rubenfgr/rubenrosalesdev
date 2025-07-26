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
          <div className="flex items-center gap-2">
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
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 py-4">
        <Input
          placeholder={t("search")}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AppButton variant="outline" label={t("actions")} iconRight={<ChevronDown />} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeleteMultiple} className="capitalize">
                <Trash className="text-red-500" /> {t("deleteSelected")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                {t("columns")} <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea className="w-[500px] min-w-full max-w-full overflow-x-auto">
        <div className="w-max">
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
      <div className="mt-2 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
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
