'use client';

import React from 'react';
import { Eye, Edit3, Trash2, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ActionMenuItem {
  key: string;
  label?: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'ghost' | 'outline' | 'default' | 'destructive';
  danger?: boolean;
  title?: string;
  disabled?: boolean;
}

export interface ActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  customActions?: ActionMenuItem[];
  className?: string;
}

export function ActionMenu({
  onEdit,
  onDelete,
  onView,
  customActions = [],
  className,
}: ActionMenuProps) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {onView && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}

      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Edit Record"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      )}

      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete Record"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      {customActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.key}
            type="button"
            variant={action.variant || 'ghost'}
            size={action.label ? 'sm' : 'icon'}
            className={cn("h-8 rounded-lg transition-colors", action.danger && "hover:text-destructive text-muted-foreground")}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            disabled={action.disabled}
            title={action.title || action.label}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {action.label && <span className="ml-1.5 text-xs font-medium">{action.label}</span>}
          </Button>
        );
      })}
    </div>
  );
}
