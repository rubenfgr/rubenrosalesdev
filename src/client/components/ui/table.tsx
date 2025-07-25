import type * as React from "react";

export function Table({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table className="min-w-full rounded border bg-white shadow" {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props}>{children}</thead>;
}

export function TableBody({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props}>{children}</tbody>;
}

export function TableRow({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props}>{children}</tr>;
}

export function TableHead({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className="px-4 py-2 text-left" {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className="px-4 py-2" {...props}>
      {children}
    </td>
  );
}
