'use client';

import React from 'react';
import { AlertItem } from '@/hooks/use-app-data';
import { X, Calendar, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileAlertCardProps {
  alert: AlertItem;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onTap: (alert: AlertItem) => void;
}

export default function MobileAlertCard({ alert, onMarkRead, onDelete, onTap }: MobileAlertCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '1st Month Expired': return 'border-l-zinc-900 bg-zinc-900/5 dark:bg-zinc-900/40';
      case '2nd Month Expired': return 'border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20';
      case '3rd Month Expired': return 'border-l-rose-600 bg-rose-500/10 dark:bg-rose-950/25';
      case 'Fully Expired': return 'border-l-slate-700 bg-slate-500/10 dark:bg-slate-900/30';
      case 'Danger': return 'border-l-rose-600 bg-rose-500/10 dark:bg-rose-950/25';
      case 'Warning': return 'border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20';
      default: return 'border-l-primary bg-card';
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case '1st Month Expired': return 'bg-zinc-900 text-zinc-100 border-zinc-700 font-bold';
      case '2nd Month Expired': return 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold';
      case '3rd Month Expired': return 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold';
      case 'Fully Expired': return 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30 font-semibold';
      case 'Danger': return 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold';
      case 'Warning': return 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold';
      default: return 'bg-muted text-foreground border-border';
    }
  };

  const renderCountdown = () => {
    if (alert.daysRemaining < 0) {
      return `${alert.category} (${Math.abs(alert.daysRemaining)}d ago)`;
    }
    if (alert.daysRemaining === 0) {
      return 'Expires Today';
    }
    return `${alert.category} (${alert.daysRemaining}d left)`;
  };

  return (
    <div 
      className={`relative w-full rounded-2xl border border-l-[5px] p-3.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer hover:border-primary/30 ${getCategoryColor(alert.category)} ${alert.isRead ? 'opacity-75' : 'opacity-100'}`}
      onClick={() => {
        if (!alert.isRead) onMarkRead(alert.id);
        onTap(alert);
      }}
    >
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-background/80 hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(alert.id); }}
          title="Dismiss Alert"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>

      <div className="pr-8 space-y-1.5">
        <div className="flex items-start gap-1.5">
          <span className="font-bold text-sm leading-snug text-foreground break-words flex-1 min-w-0">{alert.title}</span>
          {!alert.isRead && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
          )}
        </div>

        <p className="text-xs text-muted-foreground break-words">{alert.companyName} • {alert.documentType}</p>
        
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
          <span className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Expiry: {formatDate(alert.expiryDate)}</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono whitespace-nowrap ${getBadgeColor(alert.category)}`}>
              {renderCountdown()}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
