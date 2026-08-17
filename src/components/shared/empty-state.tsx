'use client';

import React from 'react';
import { FileQuestion, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search criteria or filter options.',
  icon: Icon = FileQuestion,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center space-y-3", className)}>
      <div className="w-14 h-14 bg-muted/80 rounded-2xl flex items-center justify-center border text-muted-foreground shrink-0 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <div className="max-w-xs">
        <h3 className="font-bold text-sm sm:text-base text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="rounded-xl h-9 text-xs font-semibold px-4 mt-2 shadow-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
