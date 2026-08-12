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
      case 'Expired': return 'border-l-rose-500 bg-rose-500/5 dark:bg-rose-950/20';
      case 'Today': return 'border-l-orange-500 bg-orange-500/5 dark:bg-orange-950/20';
      case '7 Days': return 'border-l-amber-500 bg-amber-500/5 dark:bg-amber-950/20';
      case '15 Days': return 'border-l-yellow-500 bg-yellow-500/5 dark:bg-yellow-950/20';
      case '30 Days': return 'border-l-blue-500 bg-blue-500/5 dark:bg-blue-950/20';
      default: return 'border-l-primary bg-card';
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Expired': return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-bold';
      case 'Today': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 font-bold animate-pulse';
      case '7 Days': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-semibold';
      case '15 Days': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 font-medium';
      case '30 Days': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 font-medium';
      default: return 'bg-muted text-foreground border-border';
    }
  };

  const renderCountdown = () => {
    if (alert.daysRemaining < 0) {
      return `Expired ${Math.abs(alert.daysRemaining)}d ago`;
    }
    if (alert.daysRemaining === 0) {
      return 'Expires Today';
    }
    return `${alert.daysRemaining} days left`;
  };

  return (
    <div 
      className={`relative w-full rounded-2xl border border-l-[5px] p-3.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer ${getCategoryColor(alert.category)} ${alert.isRead ? 'opacity-70' : 'opacity-100'}`}
      onClick={() => {
        if (!alert.isRead) onMarkRead(alert.id);
        onTap(alert);
      }}
    >
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 rounded-full text-muted-foreground hover:bg-background/80 hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(alert.id); }}
          title="Dismiss Alert"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="pr-7 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs text-foreground truncate">{alert.title}</span>
          {!alert.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{alert.companyName} • {alert.documentType}</p>
        
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <span className="text-muted-foreground flex items-center gap-1 font-mono text-[10px]">
            <Calendar className="h-3 w-3" />
            {formatDate(alert.expiryDate)}
          </span>
          <div className="flex items-center gap-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${getBadgeColor(alert.category)}`}>
              {renderCountdown()}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
