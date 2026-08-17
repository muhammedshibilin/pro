'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = 'Loading records...', className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center space-y-3", className)}>
      <Loader2 className="h-7 w-7 text-primary animate-spin" />
      <span className="text-xs font-semibold text-muted-foreground font-mono">{label}</span>
    </div>
  );
}
