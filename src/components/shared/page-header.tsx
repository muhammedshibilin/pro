'use client';

import React from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ActionItem {
  label?: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  title?: string;
  disabled?: boolean;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badgeCount?: number;
  badgeLabel?: string;
  onBack?: () => void;
  primaryAction?: ActionItem;
  secondaryActions?: ActionItem[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  badgeCount,
  badgeLabel,
  onBack,
  primaryAction,
  secondaryActions = [],
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-border/80 shadow-xs transition-all",
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10 shrink-0 mt-0.5"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            {Icon && <Icon className="w-5 h-5 text-primary shrink-0" />}
            <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {badgeCount !== undefined && (
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                {badgeCount} {badgeLabel || 'Total'}
              </span>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 break-words">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Top-Right Action Controls */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {secondaryActions.map((action, idx) => {
          const ActionIcon = action.icon;
          return (
            <Button
              key={idx}
              type="button"
              variant={action.variant || 'outline'}
              size={action.label ? 'sm' : 'icon'}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.title || action.label}
              className={cn("rounded-xl h-9 text-xs font-semibold gap-1.5", !action.label && "w-9 p-0")}
            >
              {ActionIcon && <ActionIcon className="h-4 w-4 shrink-0" />}
              {action.label && <span>{action.label}</span>}
            </Button>
          );
        })}

        {primaryAction && (
          <Button
            type="button"
            variant={primaryAction.variant || 'default'}
            size={primaryAction.label ? 'sm' : 'icon'}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            title={primaryAction.title || primaryAction.label}
            className={cn("rounded-xl h-9 text-xs font-bold gap-1.5 shrink-0", primaryAction.label ? "px-4 shadow-md shadow-primary/20" : "w-9 p-0")}
          >
            {primaryAction.icon && <primaryAction.icon className="h-4 w-4 shrink-0" />}
            {primaryAction.label && <span>{primaryAction.label}</span>}
          </Button>
        )}
      </div>
    </div>
  );
}
