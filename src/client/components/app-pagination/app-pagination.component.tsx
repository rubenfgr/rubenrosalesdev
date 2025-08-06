import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { AppSelect } from "@/client/components/app-select/app-select.component";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/client/components/ui";
import type { AppPaginationProps } from "./app-pagination.model";

export const AppPagination: React.FC<AppPaginationProps> = ({
  page,
  pageSize,
  dataLength,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  t,
}) => {
  const totalPages = Math.ceil(dataLength / pageSize);
  return (
    <div className="flex w-full flex-col-reverse items-center justify-between gap-3 md:flex-row">
      <div className="flex items-center gap-3">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 0) onPageChange(page - 1);
                }}
                aria-disabled={page === 0}
                tabIndex={page === 0 ? -1 : 0}
              >
                <ChevronLeft />
              </PaginationLink>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={i === page}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(i);
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
                  if (page + 1 < totalPages) onPageChange(page + 1);
                }}
                aria-disabled={page + 1 >= totalPages}
                tabIndex={page + 1 >= totalPages ? -1 : 0}
              >
                <ChevronRight />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-nowrap text-muted-foreground text-sm">
          {t("results")}: {dataLength}
        </span>
        <AppSelect
          value={pageSize ? String(pageSize) : ""}
          onValueChange={onPageSizeChange}
          options={pageSizeOptions.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          placeholder={t("itemsPerPage")}
        />
      </div>
    </div>
  );
};
