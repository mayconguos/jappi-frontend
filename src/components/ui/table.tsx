import { clsx } from 'clsx';
import * as React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  className?: string;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export const Table = ({ className, ...props }: TableProps) => {
  return (
    <div className="w-full overflow-auto">
      <table
        className={clsx(
          'w-full caption-bottom text-sm border-collapse',
          'border border-gray-300 rounded-md bg-white shadow-sm',
          className
        )}
        {...props}
      />
    </div>
  );
};

export const TableHeader = ({ className, ...props }: TableHeaderProps) => {
  return (
    <thead
      className={clsx(
        'border-b border-gray-300 bg-gray-50',
        className
      )}
      {...props}
    />
  );
};

export const TableBody = ({ className, ...props }: TableBodyProps) => {
  return (
    <tbody
      className={clsx(
        '[&_tr:last-child]:border-0',
        className
      )}
      {...props}
    />
  );
};

export const TableRow = ({ className, ...props }: TableRowProps) => {
  return (
    <tr
      className={clsx(
        'border-b border-gray-200 transition-colors',
        'hover:bg-gray-100 data-[state=selected]:bg-blue-50',
        'even:bg-gray-50',
        className
      )}
      {...props}
    />
  );
};

export const TableHead = ({ className, ...props }: TableHeadProps) => {
  return (
    <th
      className={clsx(
        'h-12 px-4 py-3 text-left align-middle font-semibold text-gray-800',
        'text-base [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
};

export const TableCell = ({ className, ...props }: TableCellProps) => {
  return (
    <td
      className={clsx(
        'px-4 py-3 align-middle text-gray-900',
        'text-sm [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
};
