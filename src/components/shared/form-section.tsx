'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badgeTag?: string;
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'emerald' | 'purple' | 'amber';
  className?: string;
}

const variantStyles: Record<string, { container: string; iconText: string; badge: string }> = {
  default: {
    container: 'bg-card border',
    iconText: 'text-primary',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  blue: {
    container: 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20',
    iconText: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  emerald: {
    container: 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  purple: {
    container: 'bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20',
    iconText: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  amber: {
    container: 'bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20',
    iconText: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
};

export function FormSection({
  title,
  description,
  icon: Icon,
  badgeTag,
  children,
  variant = 'default',
  className,
}: FormSectionProps) {
  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div className={cn("p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-xs transition-colors", styles.container, className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={cn("w-4 h-4 shrink-0", styles.iconText)} />}
          <span className="font-bold text-xs sm:text-sm text-foreground">{title}</span>
        </div>
        {badgeTag && (
          <span className={cn("text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border shrink-0", styles.badge)}>
            {badgeTag}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
