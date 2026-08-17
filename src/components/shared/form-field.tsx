'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  icon?: LucideIcon;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  icon: Icon,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 w-full text-left", className)}>
      <div className="flex items-center justify-between gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 text-primary shrink-0" />}
          <span className="truncate">{label}</span>
          {required && <span className="text-destructive font-bold ml-0.5">*</span>}
        </label>
      </div>

      <div className="w-full relative">
        {children}
      </div>

      {hint && !error && (
        <p className="text-[11px] text-muted-foreground leading-normal mt-1">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-destructive font-medium leading-normal mt-1 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
