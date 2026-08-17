'use client';

import React from 'react';
import { ChevronRight, Edit3, Trash2, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EntityCardProps {
  title: string;
  subtitle?: React.ReactNode;
  initials?: string;
  avatarIcon?: LucideIcon;
  statusBadge?: React.ReactNode;
  tagBadge?: React.ReactNode;
  details?: React.ReactNode;
  footer?: React.ReactNode;
  onTap?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function EntityCard({
  title,
  subtitle,
  initials,
  avatarIcon: AvatarIcon,
  statusBadge,
  tagBadge,
  details,
  footer,
  onTap,
  onEdit,
  onDelete,
  className,
}: EntityCardProps) {
  return (
    <div
      onClick={onTap}
      className={cn(
        "w-full bg-card rounded-2xl border p-4 shadow-xs active:scale-[0.99] transition-all space-y-3.5 cursor-pointer hover:border-primary/30",
        className
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 mt-0.5">
            {AvatarIcon ? <AvatarIcon className="w-5 h-5" /> : initials || title.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-base leading-snug text-foreground break-words">{title}</h3>
              {tagBadge}
              {statusBadge}
            </div>
            {subtitle}
          </div>
        </div>

        {/* Action Buttons with >= 44px Touch Targets */}
        <div className="flex items-center gap-0.5 shrink-0">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Edit Record"
              aria-label="Edit Record"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete Record"
              aria-label="Delete Record"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {onTap && (
            <div className="h-11 w-5 min-h-[44px] flex items-center justify-center text-muted-foreground shrink-0">
              <ChevronRight className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* Details Section */}
      {details}

      {/* Footer Section */}
      {footer}
    </div>
  );
}
