'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from './empty-state';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  selectedIds?: string[];
  onSelectAll?: (checked: boolean) => void;
  onToggleSelect?: (id: string) => void;
  onBulkDelete?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  selectedIds = [],
  onSelectAll,
  onToggleSelect,
  onBulkDelete,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search query or filter selection.',
  className,
}: DataTableProps<T>) {
  const isAllSelected = selectedIds.length === data.length && data.length > 0;

  return (
    <div className={cn("space-y-3 w-full", className)}>
      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && onBulkDelete && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center justify-between animate-fade-in">
          <span className="text-xs font-semibold text-primary font-mono">
            {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="rounded-lg h-8 text-xs font-semibold gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Selected</span>
          </Button>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/60 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                {onSelectAll && (
                  <th className="px-4 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.key} className={cn("px-4 py-3.5", col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-muted/40 transition-colors group">
                  {onToggleSelect && (
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => onToggleSelect(item.id)}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3.5", col.className)}>
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (onSelectAll ? 1 : 0)} className="py-12 text-center">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
