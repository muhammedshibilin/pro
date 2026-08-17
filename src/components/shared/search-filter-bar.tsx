'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StatusCard, StatusVariant } from './status-card';
import { cn } from '@/lib/utils';

export interface StatusFilterOption {
  id: string;
  label: string;
  count?: number;
  variant?: StatusVariant;
  colorClass?: string;
}

export interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilters?: StatusFilterOption[];
  activeStatusFilter?: string;
  onStatusFilterChange?: (filterId: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  statusFilters = [],
  activeStatusFilter,
  onStatusFilterChange,
  children,
  className,
}: SearchFilterBarProps) {
  return (
    <div className={cn("space-y-3 w-full", className)}>
      {/* Search & Custom Dropdowns */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-12 pl-10.5 rounded-xl bg-card border-border/80 text-sm font-medium focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        {children && (
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            {children}
          </div>
        )}
      </div>

      {/* Horizontal Status Chips Bar */}
      {statusFilters.length > 0 && onStatusFilterChange && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-hide px-0.5">
          {statusFilters.map((chip) => (
            <StatusCard
              key={chip.id}
              id={chip.id}
              label={chip.label}
              count={chip.count}
              variant={chip.variant}
              colorClass={chip.colorClass}
              isActive={(activeStatusFilter || 'ALL') === chip.id}
              onClick={() => onStatusFilterChange(chip.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
