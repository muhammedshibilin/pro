'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusVariant = 'safe' | 'warning' | 'danger' | 'expired' | 'neutral';

export interface StatusCardProps {
  id: string;
  label: string;
  count?: number;
  variant?: StatusVariant;
  icon?: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  colorClass?: string;
}

export function StatusCard({
  label,
  count,
  variant = 'neutral',
  icon: Icon,
  isActive = false,
  onClick,
  className,
  colorClass,
}: StatusCardProps) {
  const variantStyles: Record<StatusVariant, { active: string; inactive: string }> = {
    safe: {
      active: 'bg-emerald-600 text-white border-emerald-500 shadow-md',
      inactive: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30',
    },
    warning: {
      active: 'bg-amber-400 text-zinc-950 font-bold border-amber-500 shadow-md',
      inactive: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border-amber-500/30',
    },
    danger: {
      active: 'bg-rose-600 text-white border-rose-500 shadow-md',
      inactive: 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/30',
    },
    expired: {
      active: 'bg-zinc-950 dark:bg-black text-white border-zinc-700 shadow-md',
      inactive: 'bg-zinc-900/10 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-900/20 border-zinc-700/40',
    },
    neutral: {
      active: 'bg-primary text-primary-foreground border-primary shadow-md',
      inactive: 'bg-muted text-muted-foreground hover:bg-muted/80 border-border',
    },
  };

  const style = variantStyles[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 h-10 min-h-[40px] px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0 active:scale-95",
        isActive ? style.active : style.inactive,
        colorClass,
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{label}</span>
      {count !== undefined && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none shrink-0",
          isActive ? "bg-white/20 text-current" : "bg-background/80 text-foreground border"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
