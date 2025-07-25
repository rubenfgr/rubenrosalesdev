import { SelectValue } from "@radix-ui/react-select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import {
  DataTable,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/client/components/ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/client/components/ui/pagination";
import type { CertificationDTO } from "@/shared/dto";
import { useClientTranslation } from "~/client/hooks";

export function CertificationsListComponent({
  data,
  onEdit,
  onDelete,
}: {
  data: CertificationDTO[];
  onEdit: (cert: CertificationDTO) => React.ReactNode;
  onDelete: (cert: CertificationDTO) => React.ReactNode;
}) {
  const [filter, setFilter] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof CertificationDTO | null>(null);
  const [sortDesc, setSortDesc] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const pageSizeOptions = [5, 10, 20, 50];
  const [pageSize, setPageSize] = React.useState(pageSizeOptions[1]);
  const { t } = useClientTranslation();

  // Filtering
  const filtered = React.useMemo(() => {
    if (!filter) return data;
    const f = filter.toLowerCase();
    return data.filter(
      (cert) => cert.name.toLowerCase().includes(f) || cert.issuer.toLowerCase().includes(f),
    );
  }, [data, filter]);

  // Sorting
  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      if (aValue < bValue) return sortDesc ? 1 : -1;
      if (aValue > bValue) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [filtered, sortKey, sortDesc]);

  // Pagination
  const paged = React.useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // Columns
  type DataTableCellInfo = { getValue: () => unknown; row: { original: CertificationDTO } };
  const columns = [
    {
      accessorKey: "name",
      header: () => (
        <button type="button" className="font-bold" onClick={() => handleSort("name")}>
          {t("admin.certifications.name")}
        </button>
      ),
      cell: (info: DataTableCellInfo) => String(info.getValue()),
    },
    {
      accessorKey: "issuer",
      header: () => (
        <button type="button" className="font-bold" onClick={() => handleSort("issuer")}>
          {t("admin.certifications.issuer")}
        </button>
      ),
      cell: (info: DataTableCellInfo) => String(info.getValue()),
    },
    {
      accessorKey: "date",
      header: () => (
        <button type="button" className="font-bold" onClick={() => handleSort("date")}>
          {t("admin.certifications.date")}
        </button>
      ),
      cell: (info: DataTableCellInfo) =>
        info.row.original.date ? new Date(info.row.original.date).toLocaleDateString() : "",
    },
    {
      accessorKey: "url",
      header: "URL",
      cell: (info: DataTableCellInfo) =>
        info.row.original.url ? (
          <a
            href={info.row.original.url}
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
      header: t("actions"),
      cell: (info: DataTableCellInfo) => (
        <div className="flex gap-2">
          {onEdit(info.row.original)}
          {onDelete(info.row.original)}
        </div>
      ),
    },
  ];

  function handleSort(key: keyof CertificationDTO) {
    if (sortKey === key) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(false);
    }
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  const handleItemsPerPage = (value: string) => {
    const newSize = parseInt(value, 10);
    if (pageSizeOptions.includes(newSize)) {
      setPageSize(newSize);
      setPage(0);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Input
          type="text"
          placeholder={t("search")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded border px-2 py-1"
        />
      </div>
      <DataTable columns={columns} data={paged} />
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
              {Array.from({ length: Math.ceil(sorted.length / pageSize) }, (_, i) => (
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
                    if (page + 1 < Math.ceil(sorted.length / pageSize)) handlePageChange(page + 1);
                  }}
                  aria-disabled={page + 1 >= Math.ceil(sorted.length / pageSize)}
                  tabIndex={page + 1 >= Math.ceil(sorted.length / pageSize) ? -1 : 0}
                >
                  <ChevronRight />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-nowrap text-muted-foreground text-sm">
            {t("results")}: {sorted.length}
          </span>
          <Select
            value={pageSize ? String(pageSize) : ""}
            onValueChange={(value) => {
              handleItemsPerPage(value);
            }}
          >
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
