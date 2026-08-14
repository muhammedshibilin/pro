'use client';

import { formatDate } from '@/lib/utils';
import { AlertCircle, Calendar, Building, Check, Trash2, Eye, ShieldAlert, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { AlertItem } from '@/hooks/use-app-data';

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
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case '1st Month Expired':
        return 'bg-zinc-900 text-zinc-100 border-zinc-700 font-bold';
      case '2nd Month Expired':
        return 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold';
      case '3rd Month Expired':
        return 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/40 font-bold';
      case 'Danger':
        return 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/40 font-bold';
      case 'Warning':
        return 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold';
      case 'Fully Expired':
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  const isCritical = alert.category === '3rd Month Expired' || alert.category === 'Danger' || alert.category === 'Fully Expired';

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
                {alert.documentType}
              </p>
            </div>
          </div>
          <span className={cn(
            "text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border shrink-0 uppercase tracking-wider",
            getCategoryStyles(alert.category)
          )}>
            {alert.category}
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
            <span>Expiry Date: {formatDate(alert.expiryDate)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
        <div className="text-[11px] font-mono font-semibold min-w-0">
          {alert.daysRemaining < 0 ? (
            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              {Math.abs(alert.daysRemaining)} days past expiry
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
