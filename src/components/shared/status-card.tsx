'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusVariant = 'safe' | 'warning' | 'danger' | 'expired' | 'neutral';

export interface StatusCardProps {
  id: string;
  label: string;
  count: number;
  variant?: StatusVariant;
  icon?: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  colorClass?: string;
}

const variantStyles: Record<StatusVariant, { chip: string; border: string; bg: string; text: string }> = {
  safe: {
    chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-500/30 hover:border-emerald-500',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    chip: 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold',
    border: 'border-amber-500/40 hover:border-amber-500',
    bg: 'bg-amber-500/5',
    text: 'text-amber-800 dark:text-amber-300',
  },
  danger: {
    chip: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold',
    border: 'border-rose-500/40 hover:border-rose-500',
    bg: 'bg-rose-500/5',
    text: 'text-rose-700 dark:text-rose-300',
  },
  expired: {
    chip: 'bg-zinc-900 text-zinc-100 border-zinc-700',
    border: 'border-zinc-700 hover:border-zinc-500',
    bg: 'bg-zinc-900/10',
    text: 'text-zinc-800 dark:text-zinc-200',
  },
  neutral: {
    chip: 'bg-muted text-foreground border-border',
    border: 'border-border hover:border-primary/40',
    bg: 'bg-muted/20',
    text: 'text-foreground',
  },
};

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
  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between gap-2.5 shadow-xs select-none",
        colorClass || styles.chip,
        isActive ? "ring-2 ring-primary font-bold shadow-md scale-105" : "opacity-85 hover:opacity-100 hover:scale-[1.02]",
        className
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
      <span className="px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[10px] font-mono font-bold shrink-0">
        {count}
      </span>
    </button>
  );
}
