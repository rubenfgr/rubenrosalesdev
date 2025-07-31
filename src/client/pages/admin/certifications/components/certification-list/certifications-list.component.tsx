import type { ColumnDef, Row as TanstackRow, Table as TanstackTable } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import * as React from "react";
import { Button, Checkbox } from "@/client/components/ui";
import { useGetAllCertifications } from "@/client/services/api/certifications/certifications.hooks";
import type { CertificationDTO } from "@/shared/dto";
import { AppIconButton } from "~/client/components/app-icon-button/app-icon-button.component";
// import { AppTable } from "~/client/components/app-table/app-table.component";
import { AppTableServer } from "~/client/components/app-table/app-table-server.component";
import { useClientTranslation } from "~/client/hooks";

// IMPLEMENTACIÓN ORIGINAL COMENTADA PARA REFERENCIA
/*
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
  const columns = React.useMemo<ColumnDef<CertificationDTO>[]>(...);
  return (
    <div className="flex max-w-full flex-col gap-3">
      <AppTable data={data} columns={columns} onDeleteMultiple={onDeleteMultiple} />
    </div>
  );
}
*/

// NUEVA IMPLEMENTACIÓN CON PAGINACIÓN SERVER-SIDE
export function CertificationsListComponent({
  onEdit,
  onDelete,
  onDeleteMultiple,
}: {
  onEdit: (cert: CertificationDTO) => void;
  onDelete: (cert: CertificationDTO) => void;
  onDeleteMultiple: (certs: CertificationDTO[]) => void;
}) {
  const { t } = useClientTranslation();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [filter, setFilter] = React.useState("");
  const [sort, setSort] = React.useState<{ field: string; direction: "asc" | "desc" } | undefined>(
    undefined,
  );

  // Columnas igual que antes
  const columns = React.useMemo<ColumnDef<CertificationDTO>[]>(
    () => [
      {
        id: "select",
        header: ({ table }: { table: TanstackTable<CertificationDTO> }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }: { row: TanstackRow<CertificationDTO> }) => (
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
        header: ({
          column,
        }: {
          column: import("@tanstack/react-table").Column<CertificationDTO, unknown>;
        }) => (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc = column.getIsSorted() === "asc";
              column.toggleSorting(isAsc);
              setSort({ field: "name", direction: isAsc ? "desc" : "asc" });
            }}
            className="font-bold"
          >
            {t("admin.certifications.name")} <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: { row: TanstackRow<CertificationDTO> }) => (
          <span>{row.getValue("name")}</span>
        ),
      },
      {
        accessorKey: "issuer",
        header: ({
          column,
        }: {
          column: import("@tanstack/react-table").Column<CertificationDTO, unknown>;
        }) => (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc = column.getIsSorted() === "asc";
              column.toggleSorting(isAsc);
              setSort({ field: "issuer", direction: isAsc ? "desc" : "asc" });
            }}
            className="font-bold"
          >
            {t("admin.certifications.issuer")} <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: { row: TanstackRow<CertificationDTO> }) => (
          <span>{row.getValue("issuer")}</span>
        ),
      },
      {
        accessorKey: "date",
        header: ({
          column,
        }: {
          column: import("@tanstack/react-table").Column<CertificationDTO, unknown>;
        }) => (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc = column.getIsSorted() === "asc";
              column.toggleSorting(isAsc);
              setSort({ field: "date", direction: isAsc ? "desc" : "asc" });
            }}
            className="font-bold"
          >
            {t("admin.certifications.date")} <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: { row: TanstackRow<CertificationDTO> }) =>
          row.original.date ? new Date(row.original.date).toLocaleDateString() : "",
      },
      {
        accessorKey: "url",
        header: () => "URL",
        cell: ({ row }: { row: TanstackRow<CertificationDTO> }) =>
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
        cell: ({ row }: { row: TanstackRow<CertificationDTO> }) => (
          <div className="flex items-center gap-3">
            <AppIconButton color="blue" icon={<Edit />} onClick={() => onEdit(row.original)} />
            <AppIconButton color="red" icon={<Trash />} onClick={() => onDelete(row.original)} />
          </div>
        ),
      },
    ],
    [t, onEdit, onDelete],
  );

  const { data, isLoading } = useGetAllCertifications({
    page,
    pageSize,
    filter: filter ? { name: { contains: filter } } : undefined,
    sort,
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex max-w-full flex-col gap-3">
      <AppTableServer
        data={rows}
        columns={columns}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onDeleteMultiple={onDeleteMultiple}
        isLoading={isLoading}
        onFilterChange={setFilter}
        filterValue={filter}
      />
    </div>
  );
}
