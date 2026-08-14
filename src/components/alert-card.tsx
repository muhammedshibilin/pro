'use client';

import { formatDate } from '@/lib/utils';
import { AlertCircle, Calendar, Building, Check, Trash2, Eye, ShieldAlert, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface AlertItem {
  id: string;
  title: string;
  companyName: string;
  documentType: string;
  expiryDate: string;
  daysRemaining: number;
  entityType: 'employee' | 'document';
  entityId: string;
  category: 'Expired' | 'Today' | '7 Days' | '15 Days' | '30 Days';
  isRead: boolean;
}

interface AlertCardProps {
  alert: AlertItem;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenEmployee: (id: string) => void;
  onOpenCompany: (companyName: string) => void;
}

export function AlertCard({
  alert,
  onMarkRead,
  onDelete,
  onOpenEmployee,
  onOpenCompany,
}: AlertCardProps) {
  const getCategoryStyles = (category: typeof alert.category) => {
    switch (category) {
      case 'Expired':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 shadow-xs animate-pulse';
      case 'Today':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 shadow-xs font-bold';
      case '7 Days':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case '15 Days':
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20';
      case '30 Days':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  const isCritical = alert.category === 'Expired' || alert.category === 'Today';

  return (
    <div
      className={cn(
        "p-4 border rounded-2xl bg-card text-card-foreground shadow-xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 group",
        isCritical ? "border-rose-500/30 bg-gradient-to-b from-rose-500/5 to-transparent" : "border-border/80",
        alert.isRead && "opacity-60 grayscale-[20%]"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              "p-2 rounded-xl shrink-0 transition-colors",
              isCritical ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-primary/10 text-primary"
            )}>
              {isCritical ? <ShieldAlert className="h-4.5 w-4.5" /> : <AlertCircle className="h-4.5 w-4.5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm leading-tight text-foreground truncate group-hover:text-primary transition-colors">
                {alert.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-mono">
                Doc: {alert.documentType}
              </p>
            </div>
          </div>
          <span className={cn(
            "text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border shrink-0 uppercase tracking-wider",
            getCategoryStyles(alert.category)
          )}>
            {alert.category === 'Today' ? 'DUE TODAY' : alert.category}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50">
          <button
            onClick={() => onOpenCompany(alert.companyName)}
            className="flex items-center gap-2 hover:text-primary transition-colors text-left w-full truncate font-medium"
          >
            <Building className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate underline underline-offset-2">{alert.companyName}</span>
          </button>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>Expires: {formatDate(alert.expiryDate)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
        <div className="text-[11px] font-mono font-semibold min-w-0">
          {alert.daysRemaining < 0 ? (
            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              Overdue {-alert.daysRemaining} days
            </span>
          ) : alert.daysRemaining === 0 ? (
            <span className="text-amber-700 dark:text-amber-300 flex items-center gap-1 font-bold">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Expires Today
            </span>
          ) : (
            <span className="text-muted-foreground">{alert.daysRemaining} days remaining</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {alert.entityType === 'employee' && (
            <Button
              variant="ghost"
              size="icon"
              title="Open Employee Profile"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => onOpenEmployee(alert.entityId)}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}

          {!alert.isRead && (
            <Button
              variant="ghost"
              size="icon"
              title="Mark as Read"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => onMarkRead(alert.id)}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            title="Delete Alert"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
            onClick={() => onDelete(alert.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
