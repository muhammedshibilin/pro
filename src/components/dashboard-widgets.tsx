import React from 'react';
import { Document, Employee, Company } from '@/types';
import { getDaysRemaining, formatDate } from '@/lib/utils';
import { calculateEmployeeQidStatus, calculateCompanyDocumentStatus, EMPLOYEE_STATUS_META, COMPANY_DOC_STATUS_META } from '@/lib/status-calculator';
import { ShieldAlert, Clock, UserCheck, Building2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetProps {
  documents: Document[];
  employees: Employee[];
  companies?: Company[];
}

// 1. Recent Alerts Widget (Non-Safe QIDs & Company Documents)
export function RecentAlerts({ documents, employees }: WidgetProps) {
  const alertDocs = documents
    .filter((d) => calculateCompanyDocumentStatus(d.expiryDate) !== 'SAFE')
    .map((d) => ({
      id: d.id,
      title: d.documentType,
      subtitle: d.company?.companyName || 'Corporate Document',
      meta: d.documentNumber,
      status: calculateCompanyDocumentStatus(d.expiryDate),
      days: getDaysRemaining(d.expiryDate),
      type: 'document' as const,
    }));

  const alertQids = employees
    .filter((e) => calculateEmployeeQidStatus(e.qidExpiry) !== 'SAFE')
    .map((e) => ({
      id: e.id,
      title: `${e.employeeName} (QID)`,
      subtitle: e.company?.companyName || 'Staff Record',
      meta: e.qidNumber,
      status: calculateEmployeeQidStatus(e.qidExpiry),
      days: getDaysRemaining(e.qidExpiry),
      type: 'employee' as const,
    }));

  const allAlerts = [...alertDocs, ...alertQids]
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  return (
    <div className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-xs flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-rose-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4 animate-pulse" />
          </div>
          <h3 className="font-display font-bold text-sm text-foreground">Critical Compliance Feed</h3>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
          {allAlerts.length} Attention Items
        </span>
      </div>

      <div className="flex-1 divide-y divide-border/50">
        {allAlerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500/60" />
            <span>All permits and visas are in safe status.</span>
          </div>
        ) : (
          allAlerts.map((alert) => {
            const isBlack = alert.status === 'MONTH_1_EXPIRED';
            const isYellow = alert.status === 'WARNING' || alert.status === 'MONTH_2_EXPIRED';

            let badgeClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
            if (isBlack) badgeClass = 'bg-zinc-900 text-zinc-100 border-zinc-700';
            else if (isYellow) badgeClass = 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold';

            return (
              <div key={alert.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors group">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">{alert.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {alert.subtitle} &bull; <span className="font-mono">{alert.meta}</span>
                  </p>
                </div>
                <span className={cn("text-[10px] font-mono font-bold px-2 py-1 rounded-lg border shrink-0", badgeClass)}>
                  {alert.days < 0 ? `${Math.abs(alert.days)}d overdue` : `${alert.days}d left`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 2. Upcoming Expiries Widget
export function UpcomingExpiries({ documents, employees }: WidgetProps) {
  const expiringDocs = documents
    .filter((d) => {
      const s = calculateCompanyDocumentStatus(d.expiryDate);
      return s === 'WARNING' || s === 'DANGER';
    })
    .map((d) => ({
      id: d.id,
      title: d.documentType,
      subtitle: d.company?.companyName || 'Corporate Document',
      days: getDaysRemaining(d.expiryDate),
      date: d.expiryDate,
    }));

  const expiringQids = employees
    .filter((e) => {
      const s = calculateEmployeeQidStatus(e.qidExpiry);
      return s !== 'SAFE';
    })
    .map((e) => ({
      id: e.id,
      title: `${e.employeeName} (QID)`,
      subtitle: e.company?.companyName || 'Staff Sponsorship',
      days: getDaysRemaining(e.qidExpiry),
      date: e.qidExpiry,
    }));

  const items = [...expiringDocs, ...expiringQids]
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  return (
    <div className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-xs flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-amber-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
          <h3 className="font-display font-bold text-sm text-foreground">Timeline Expirations</h3>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          {items.length} Due Soon
        </span>
      </div>

      <div className="flex-1 divide-y divide-border/50">
        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500/60" />
            <span>No upcoming deadlines in the horizon.</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors group">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {item.subtitle} &bull; <span className="font-mono">{formatDate(item.date)}</span>
                </p>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                {item.days < 0 ? `${Math.abs(item.days)}d ago` : item.days === 0 ? 'Due Today' : `${item.days}d left`}
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
  const recent = [...employees]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-xs flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-blue-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <UserCheck className="h-4 w-4" />
          </div>
          <h3 className="font-display font-bold text-sm text-foreground">Recent Staff Registrations</h3>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
          {employees.length} Total
        </span>
      </div>

      <div className="flex-1 divide-y divide-border/50">
        {recent.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <UserCheck className="h-6 w-6 text-muted-foreground/40" />
            <span>No employee records found.</span>
          </div>
        ) : (
          recent.map((emp) => {
            const status = calculateEmployeeQidStatus(emp.qidExpiry);
            const meta = EMPLOYEE_STATUS_META[status];

            return (
              <div key={emp.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-indigo-500/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-primary/20">
                    {emp.employeeName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">{emp.employeeName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-mono">
                      QID: {emp.qidNumber}
                    </p>
                  </div>
                </div>
                <span className={cn("text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shrink-0", meta.badgeBg, meta.badgeText, meta.badgeBorder)}>
                  {meta.shortLabel}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 4. Company Compliance Status Widget
export function CompanyStatusGrid({ companies = [] }: WidgetProps) {
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
              <th className="p-3.5">CR Status</th>
              <th className="p-3.5">License Status</th>
              <th className="p-3.5 pr-6">Compliance Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                  No company summary data available.
                </td>
              </tr>
            ) : (
              companies.map((company) => {
                const crStatus = company.crExpiry ? calculateCompanyDocumentStatus(company.crExpiry) : 'SAFE';
                const licStatus = company.licenseExpiry ? calculateCompanyDocumentStatus(company.licenseExpiry) : 'SAFE';
                const crMeta = COMPANY_DOC_STATUS_META[crStatus];
                const licMeta = COMPANY_DOC_STATUS_META[licStatus];

                const isDanger = crStatus === 'DANGER' || licStatus === 'DANGER';
                const isWarning = crStatus === 'WARNING' || licStatus === 'WARNING';

                return (
                  <tr key={company.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">{company.companyName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">Auth: {company.ownerName || '—'}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                        {company.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border font-mono", crMeta.badgeBg, crMeta.badgeText, crMeta.badgeBorder)}>
                        CR: {crMeta.shortLabel}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border font-mono", licMeta.badgeBg, licMeta.badgeText, licMeta.badgeBorder)}>
                        Lic: {licMeta.shortLabel}
                      </span>
                    </td>
                    <td className="p-3.5 pr-6">
                      {isDanger ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                          <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                          Danger / Action Required
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          Warning (Renewal Due)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          Compliant (3+ Mo)
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
