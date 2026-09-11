import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns, data, pageSize = 10,
  toolbar, emptyMessage = 'No records found.', loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting]             = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    initialState: { pagination: { pageSize } },
    state: { sorting, columnFilters, columnVisibility },
  });

  return (
    <div className="space-y-3">
      {toolbar && <div>{toolbar}</div>}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : (
                        header.column.getCanSort() ? (
                          <button
                            className="flex items-center gap-1 hover:text-slate-800 transition-colors"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc'  ? <ArrowUp className="h-3 w-3" />  :
                             header.column.getIsSorted() === 'desc' ? <ArrowDown className="h-3 w-3" /> :
                             <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                          </button>
                        ) : flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-6 w-6 animate-spin text-green-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      <span className="text-sm">Loading…</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-sm text-slate-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 last:border-0"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-5 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-700">{table.getState().pagination.pageIndex + 1}</span>
            {' '}of <span className="font-semibold text-slate-700">{table.getPageCount()}</span>
            {' '}— <span className="font-semibold text-slate-700">{table.getFilteredRowModel().rows.length}</span> rows
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
              const pageIdx = table.getState().pagination.pageIndex;
              const total   = table.getPageCount();
              let start = Math.max(0, pageIdx - 2);
              if (start + 5 > total) start = Math.max(0, total - 5);
              const p = start + i;
              return (
                <Button
                  key={p}
                  variant={p === pageIdx ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => table.setPageIndex(p)}
                >
                  {p + 1}
                </Button>
              );
            })}
            <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
