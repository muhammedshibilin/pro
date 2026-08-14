import React from 'react';
import { Building2, Users, Clock, CalendarRange, CalendarDays, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  totalCompanies: number;
  totalEmployees: number;
  expiredCount: number;
  expiringToday: number;
  expiring7Days: number;
  expiring30Days: number;
  loading: boolean;
  onCardClick: (targetView: 'companies' | 'employees' | 'alerts') => void;
}

export function DashboardStatsOverview({
  totalCompanies,
  totalEmployees,
  expiredCount,
  expiringToday,
  expiring7Days,
  expiring30Days,
  loading,
  onCardClick,
}: DashboardStatsProps) {
  const cards = [
    {
      title: 'Active Companies',
      value: totalCompanies,
      description: 'Business entities monitored',
      icon: Building2,
      accentColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
      badge: 'Managed',
      badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
      target: 'companies' as const,
    },
    {
      title: 'Monitored Staff',
      value: totalEmployees,
      description: 'Employee compliance profiles',
      icon: Users,
      accentColor: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
      badge: 'Active',
      badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
      target: 'employees' as const,
    },
    {
      title: 'Expired Documents',
      value: expiredCount,
      description: 'Immediate action required',
      icon: ShieldAlert,
      accentColor: 'from-rose-500/25 to-red-600/10 border-rose-500/40 text-rose-600 dark:text-rose-400',
      badge: expiredCount > 0 ? 'CRITICAL' : 'Clean',
      badgeBg: expiredCount > 0 ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold animate-pulse' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      isAlert: expiredCount > 0,
      target: 'alerts' as const,
    },
    {
      title: 'Expires Today',
      value: expiringToday,
      description: 'Deadline end of day',
      icon: Clock,
      accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
      badge: expiringToday > 0 ? 'DUE NOW' : 'Clear',
      badgeBg: expiringToday > 0 ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      isAlert: expiringToday > 0,
      target: 'alerts' as const,
    },
    {
      title: 'Expires in 7 Days',
      value: expiring7Days,
      description: 'Requires renewal queue',
      icon: CalendarRange,
      accentColor: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400',
      badge: 'Upcoming',
      badgeBg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
      target: 'alerts' as const,
    },
    {
      title: 'Expires in 30 Days',
      value: expiring30Days,
      description: 'Scheduled for review',
      icon: CalendarDays,
      accentColor: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400',
      badge: 'Horizon',
      badgeBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
      target: 'alerts' as const,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-card border border-border/60 animate-pulse skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 w-full">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <button
            key={i}
            onClick={() => onCardClick(card.target)}
            className={cn(
              "group relative flex flex-col justify-between p-4 rounded-2xl border bg-card text-left transition-all duration-300 overflow-hidden cursor-pointer",
              "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40",
              card.isAlert ? "border-rose-500/30 bg-gradient-to-b from-rose-500/5 to-transparent" : "border-border/70"
            )}
          >
            {/* Ambient Accent Light */}
            <div className={cn("absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl blur-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity", card.accentColor)} />

            <div className="flex items-center justify-between w-full relative z-10">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn("p-2 rounded-xl bg-muted/60 border border-border/50 transition-colors group-hover:bg-background", card.accentColor)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <span className={cn("text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full font-semibold shrink-0", card.badgeBg)}>
                {card.badge}
              </span>
            </div>

            <div className="mt-3 relative z-10">
              <div className="flex items-baseline justify-between">
                <span className={cn(
                  "font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground",
                  card.isAlert && "text-rose-600 dark:text-rose-400"
                )}>
                  {card.value}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <span className="text-[11px] font-medium text-foreground/90 block truncate mt-1">
                {card.title}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                {card.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
