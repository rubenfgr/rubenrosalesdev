export interface AppPaginationProps {
  page: number;
  pageSize: number;
  dataLength: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
  t: (key: string) => string;
}
