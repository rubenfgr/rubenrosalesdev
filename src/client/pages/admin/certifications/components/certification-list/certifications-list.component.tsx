import * as React from "react";
import { DataTable } from "@/client/components/ui";
import type { CertificationDTO } from "@/shared/dto";

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
  const pageSize = 10;

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
  }, [sorted, page]);

  // Columns
  const columns = [
    {
      accessorKey: "name",
      header: () => (
        <button type="button" className="font-bold" onClick={() => handleSort("name")}>
          Name
        </button>
      ),
      cell: (info: any) => String(info.getValue()),
    },
    {
      accessorKey: "issuer",
      header: () => (
        <button type="button" className="font-bold" onClick={() => handleSort("issuer")}>
          Issuer
        </button>
      ),
      cell: (info: any) => String(info.getValue()),
    },
    {
      accessorKey: "date",
      header: () => (
        <button type="button" className="font-bold" onClick={() => handleSort("date")}>
          Date
        </button>
      ),
      cell: (info: any) =>
        info.row.original.date ? new Date(info.row.original.date).toLocaleDateString() : "",
    },
    {
      accessorKey: "url",
      header: "URL",
      cell: (info: any) =>
        info.row.original.url ? (
          <a
            href={info.row.original.url}
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Link
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info: any) => (
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

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by name or issuer..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded border px-2 py-1"
        />
      </div>
      <DataTable columns={columns} data={paged} />
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          className="rounded border px-2 py-1"
          disabled={page === 0}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {Math.ceil(sorted.length / pageSize)}
        </span>
        <button
          type="button"
          className="rounded border px-2 py-1"
          disabled={page + 1 >= Math.ceil(sorted.length / pageSize)}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
