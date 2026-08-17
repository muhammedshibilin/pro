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
        "flex flex-row items-center justify-between gap-2 bg-card/60 backdrop-blur-md p-3 sm:p-5 rounded-2xl border border-border/80 shadow-xs transition-all w-full max-w-full overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {Icon && <Icon className="w-5 h-5 text-primary shrink-0" />}
            <h1 className="text-base sm:text-xl font-display font-extrabold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {badgeCount !== undefined && (
              <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                {badgeCount} {badgeLabel || 'Total'}
              </span>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground text-xs mt-0.5 break-words line-clamp-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Top-Right Action Controls with >= 44px Touch Targets */}
      <div className="flex items-center gap-1.5 shrink-0">
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
              className={cn(
                "rounded-xl h-11 min-h-[44px] text-xs font-semibold gap-1.5",
                action.label ? "px-3" : "w-11 min-w-[44px] p-0"
              )}
            >
              {ActionIcon && <ActionIcon className="h-4 w-4 shrink-0" />}
              {action.label && <span className="hidden xs:inline">{action.label}</span>}
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
            className={cn(
              "rounded-xl h-11 min-h-[44px] text-xs font-bold gap-1.5 shrink-0",
              primaryAction.label ? "px-3.5 shadow-md shadow-primary/20" : "w-11 min-w-[44px] p-0"
            )}
          >
            {primaryAction.icon && <primaryAction.icon className="h-4 w-4 shrink-0" />}
            {primaryAction.label && <span>{primaryAction.label}</span>}
          </Button>
        )}
      </div>
    </div>
  );
}
