import React from 'react';
import { Document, Employee, Company } from '@/types';
import { getDaysRemaining, formatDate } from '@/lib/utils';
import { ShieldAlert, Clock, UserCheck, Building2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';


interface WidgetProps {
  documents: Document[];
  employees: Employee[];
  companies?: Company[];
}

// 1. Recent Alerts Widget (Already Expired)
export function RecentAlerts({ documents, employees }: WidgetProps) {
  const expiredDocs = documents
    .filter((d) => getDaysRemaining(d.expiryDate) < 0)
    .map((d) => ({
      id: d.id,
      title: d.documentType,
      subtitle: d.company?.companyName || 'Company Document',
      meta: d.documentNumber,
      days: getDaysRemaining(d.expiryDate),
      type: 'document' as const,
    }));

  const expiredQids = employees
    .filter((e) => getDaysRemaining(e.qidExpiry) < 0)
    .map((e) => ({
      id: e.id,
      title: `${e.employeeName} (QID)`,
      subtitle: e.company?.companyName || 'Staff Sponsorship',
      meta: e.qidNumber,
      days: getDaysRemaining(e.qidExpiry),
      type: 'employee' as const,
    }));

  const allAlerts = [...expiredDocs, ...expiredQids]
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  return (
    <div className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-xs flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-rose-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4 animate-pulse" />
          </div>
          <h3 className="font-display font-bold text-sm text-foreground">Critical Breaches</h3>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
          {allAlerts.length} Active
        </span>
      </div>

      <div className="flex-1 divide-y divide-border/50">
        {allAlerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500/60" />
            <span>No active compliance breaches.</span>
          </div>
        ) : (
          allAlerts.map((alert) => (
            <div key={alert.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors group">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">{alert.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {alert.subtitle} &bull; <span className="font-mono">{alert.meta}</span>
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 shrink-0">
                {-alert.days}d overdue
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 2. Upcoming Expiries Widget (Expiring in next 30 days)
export function UpcomingExpiries({ documents, employees }: WidgetProps) {
  const expiringDocs = documents
    .filter((d) => {
      const days = getDaysRemaining(d.expiryDate);
      return days >= 0 && days <= 30;
    })
    .map((d) => ({
      id: d.id,
      title: d.documentType,
      subtitle: d.company?.companyName || 'Company document',
      days: getDaysRemaining(d.expiryDate),
      date: d.expiryDate,
    }));

  const expiringQids = employees
    .filter((e) => {
      const days = getDaysRemaining(e.qidExpiry);
      return days >= 0 && days <= 30;
    })
    .map((e) => ({
      id: e.id,
      title: `${e.employeeName} (QID)`,
      subtitle: e.company?.companyName || 'Staff Sponsorship',
      days: getDaysRemaining(e.qidExpiry),
      date: e.qidExpiry,
    }));

  const upcoming = [...expiringDocs, ...expiringQids]
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  return (
    <div className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-xs flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-amber-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
          <h3 className="font-display font-bold text-sm text-foreground">30-Day Watch Queue</h3>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          {upcoming.length} Pending
        </span>
      </div>

      <div className="flex-1 divide-y divide-border/50">
        {upcoming.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500/60" />
            <span>No upcoming deadlines in 30 days.</span>
          </div>
        ) : (
          upcoming.map((item) => (
            <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors group">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {item.subtitle} &bull; <span className="font-mono">{formatDate(item.date)}</span>
                </p>
              </div>
              <span className={cn(
                "text-[10px] font-mono font-bold px-2 py-1 rounded-lg border shrink-0",
                item.days === 0
                  ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
              )}>
                {item.days === 0 ? 'DUE TODAY' : `${item.days}d left`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 3. Recently Added Employees Widget
export function RecentlyAddedEmployees({ employees }: WidgetProps) {
  const recentEmployees = [...employees]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-xs flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-indigo-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <UserCheck className="h-4 w-4" />
          </div>
          <h3 className="font-display font-bold text-sm text-foreground">Recent Personnel</h3>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
          New Onboarding
        </span>
      </div>

      <div className="flex-1 divide-y divide-border/50">
        {recentEmployees.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">No employees registered.</div>
        ) : (
          recentEmployees.map((emp) => (
            <div key={emp.id} className="p-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary flex items-center justify-center font-display font-bold text-xs shrink-0 ring-1 ring-primary/20">
                {emp.employeeName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">{emp.employeeName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  Code: <span className="font-mono">{emp.employeeCode}</span> &bull; {emp.company?.companyName}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 4. Company Compliance Status Widget
export function CompanyStatusGrid({ companies = [], documents }: WidgetProps) {
  return (
    <div className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-xs flex flex-col h-full overflow-hidden col-span-full">
      <div className="p-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-foreground">Entity Compliance Matrix</h3>
            <p className="text-[11px] text-muted-foreground">Health status across registered business units</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <th className="p-3.5 pl-6">Company Entity</th>
              <th className="p-3.5">Registration Status</th>
              <th className="p-3.5">Document Portfolio</th>
              <th className="p-3.5 pr-6">Compliance Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">
                  No company summary data available.
                </td>
              </tr>
            ) : (
              companies.map((company) => {
                const companyDocs = documents.filter((d) => d.companyId === company.id);
                const expiredDocsCount = companyDocs.filter((d) => getDaysRemaining(d.expiryDate) < 0).length;
                const expiringSoonCount = companyDocs.filter((d) => {
                  const days = getDaysRemaining(d.expiryDate);
                  return days >= 0 && days <= 30;
                }).length;

                const hasAlerts = expiredDocsCount > 0 || expiringSoonCount > 0;

                return (
                  <tr key={company.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">{company.companyName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {company.id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border font-mono",
                        company.status === 'Active'
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      )}>
                        {company.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-semibold border border-emerald-500/20">
                          {companyDocs.length - expiredDocsCount - expiringSoonCount} Valid
                        </span>
                        {expiredDocsCount > 0 && (
                          <span className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-md font-semibold border border-rose-500/20">
                            {expiredDocsCount} Expired
                          </span>
                        )}
                        {expiringSoonCount > 0 && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md font-semibold border border-amber-500/20">
                            {expiringSoonCount} Watch
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 pr-6">
                      {hasAlerts ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                          <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                          Requires Action
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
