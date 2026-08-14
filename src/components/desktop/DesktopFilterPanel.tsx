'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DesktopFilterPanelProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  children?: React.ReactNode;
}

export function DesktopFilterPanel({ searchValue, onSearchChange, children }: DesktopFilterPanelProps) {
  return (
    <div className="flex items-center gap-4 bg-card p-4 rounded-lg shadow-sm border mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search..." 
          value={searchValue} 
          onChange={(e) => onSearchChange(e.target.value)} 
          className="pl-9 bg-background focus-visible:ring-primary"
        />
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-1 justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
