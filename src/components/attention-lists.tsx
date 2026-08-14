'use client';

import React from 'react';
import { Company, Employee, CompanyDocument } from '@/types';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { 
  calculateCompanyDocumentStatus, 
  calculateEmployeeQidStatus, 
  COMPANY_DOC_STATUS_META, 
  EMPLOYEE_STATUS_META,
  CompanyDocumentStatus,
  EmployeeQidStatus
} from '@/lib/status-calculator';
import { FileCheck, ShieldCheck, CreditCard, FileText, ChevronRight, Building2, Briefcase, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface UrgentCompanyDocItem {
  id: string;
  companyId: string;
  companyName: string;
  documentType: string;
  documentNumber: string;
  expiryDate: string;
  daysRemaining: number;
  status: CompanyDocumentStatus;
  photo?: string | null;
}

export interface UrgentEmployeeItem {
  id: string;
  employeeName: string;
  role: string;
  qidNumber: string;
  qidExpiry: string;
  daysRemaining: number;
  status: EmployeeQidStatus;
  companyName: string;
  workingCompanyName?: string | null;
  phone?: string | null;
}

interface CompanyAttentionListProps {
  companies: Company[];
  documents: CompanyDocument[];
  onOpenCompany: (company: Company) => void;
  onViewAll: () => void;
}

export function CompanyAttentionList({
  companies,
  documents,
  onOpenCompany,
  onViewAll,
}: CompanyAttentionListProps) {
  // Aggregate all corporate documents across companies
  const docItems: UrgentCompanyDocItem[] = [];

  companies.forEach((c) => {
    // 1. Commercial Registration (CR)
    if (c.crExpiry) {
      docItems.push({
        id: `cr-${c.id}`,
        companyId: c.id,
        companyName: c.companyName,
        documentType: 'Commercial Registration (CR)',
        documentNumber: c.crNumber || '—',
        expiryDate: c.crExpiry,
        daysRemaining: getDaysRemaining(c.crExpiry),
        status: calculateCompanyDocumentStatus(c.crExpiry),
        photo: c.crPhoto,
      });
    }

    // 2. Trade License
    if (c.licenseExpiry) {
      docItems.push({
        id: `lic-${c.id}`,
        companyId: c.id,
        companyName: c.companyName,
        documentType: 'Trade License',
        documentNumber: c.licenseNumber || '—',
        expiryDate: c.licenseExpiry,
        daysRemaining: getDaysRemaining(c.licenseExpiry),
        status: calculateCompanyDocumentStatus(c.licenseExpiry),
        photo: c.licensePhoto,
      });
    }

    // 3. Computer Card (inherits licenseExpiry)
    if (c.computerCardNumber && c.licenseExpiry) {
      docItems.push({
        id: `cc-${c.id}`,
        companyId: c.id,
        companyName: c.companyName,
        documentType: 'Computer Card',
        documentNumber: c.computerCardNumber,
        expiryDate: c.licenseExpiry,
        daysRemaining: getDaysRemaining(c.licenseExpiry),
        status: calculateCompanyDocumentStatus(c.licenseExpiry),
        photo: c.computerCardPhoto,
      });
    }
  });

  // Also include uploaded documents
  documents.forEach((d) => {
    const comp = companies.find((c) => c.id === d.companyId);
    docItems.push({
      id: `doc-${d.id}`,
      companyId: d.companyId,
      companyName: comp?.companyName || 'Corporate Entity',
      documentType: d.documentType,
      documentNumber: d.documentNumber,
      expiryDate: d.expiryDate,
      daysRemaining: getDaysRemaining(d.expiryDate),
      status: calculateCompanyDocumentStatus(d.expiryDate),
      photo: d.attachment,
    });
  });

  // Sort by urgency: DANGER (red) -> WARNING (yellow) -> SAFE (green), then by days remaining
  const statusPriority: Record<CompanyDocumentStatus, number> = {
    DANGER: 1,
    WARNING: 2,
    SAFE: 3,
  };

  docItems.sort((a, b) => {
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    return a.daysRemaining - b.daysRemaining;
  });

  // Show up to 8 top urgent items on the dashboard
  const displayItems = docItems.slice(0, 8);

  const getDocIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('cr') || t.includes('commercial')) return <FileCheck className="w-4 h-4 text-blue-500 shrink-0" />;
    if (t.includes('license') || t.includes('trade')) return <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (t.includes('computer') || t.includes('establishment')) return <CreditCard className="w-4 h-4 text-purple-500 shrink-0" />;
    return <FileText className="w-4 h-4 text-primary shrink-0" />;
  };

  const formatRemainingText = (days: number) => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires Today';
    if (days === 1) return 'Expires Tomorrow';
    if (days <= 30) return `Expires in ${days} days`;
    const months = Math.round(days / 30);
    return `Expires in ~${months} month${months > 1 ? 's' : ''} (${days}d)`;
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Company Documents Requiring Attention
          </h3>
          <p className="text-xs text-muted-foreground">
            Real-time compliance ranking across Commercial Registrations, Trade Licenses, and Computer Cards.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewAll} 
          className="text-xs h-8 rounded-xl font-semibold gap-1"
        >
          <span>View Company Registry</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {displayItems.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border text-center space-y-1.5 shadow-xs">
          <p className="font-bold text-sm text-foreground">No Corporate Documents Recorded</p>
          <p className="text-xs text-muted-foreground">Add companies and licenses to monitor their compliance status.</p>
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Company Name</th>
                  <th className="px-4 py-3">Document Type</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Remaining Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {displayItems.map((item) => {
                  const meta = COMPANY_DOC_STATUS_META[item.status];
                  const comp = companies.find((c) => c.id === item.companyId);

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      onClick={() => comp && onOpenCompany(comp)}
                    >
                      <td className="px-4 py-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[200px]">{item.companyName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          {getDocIcon(item.documentType)}
                          <span className="truncate max-w-[180px]">{item.documentType}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-foreground">
                        {formatDate(item.expiryDate)}
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px]">
                        <span className={cn(
                          "font-semibold",
                          item.status === 'DANGER' ? "text-rose-600 dark:text-rose-400" :
                          item.status === 'WARNING' ? "text-amber-600 dark:text-amber-400" :
                          "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {formatRemainingText(item.daysRemaining)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border whitespace-nowrap",
                          meta.badgeBg,
                          meta.badgeText,
                          meta.badgeBorder
                        )}>
                          {meta.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="text-primary group-hover:translate-x-0.5 inline-flex items-center gap-1 font-semibold text-[11px] transition-transform">
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="sm:hidden divide-y divide-border/60">
            {displayItems.map((item) => {
              const meta = COMPANY_DOC_STATUS_META[item.status];
              const comp = companies.find((c) => c.id === item.companyId);

              return (
                <div
                  key={item.id}
                  onClick={() => comp && onOpenCompany(comp)}
                  className="p-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors space-y-2.5 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-foreground truncate">{item.companyName}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        {getDocIcon(item.documentType)}
                        <span className="truncate">{item.documentType}</span>
                      </div>
                    </div>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border whitespace-nowrap shrink-0",
                      meta.badgeBg,
                      meta.badgeText,
                      meta.badgeBorder
                    )}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Expiry: {formatDate(item.expiryDate)}</span>
                    <span className={cn(
                      "font-semibold",
                      item.status === 'DANGER' ? "text-rose-600 dark:text-rose-400" :
                      item.status === 'WARNING' ? "text-amber-600 dark:text-amber-400" :
                      "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {formatRemainingText(item.daysRemaining)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface EmployeeAttentionListProps {
  employees: Employee[];
  companies: Company[];
  onOpenEmployee: (employeeId: string) => void;
  onViewAll: () => void;
}

export function EmployeeAttentionList({
  employees,
  companies,
  onOpenEmployee,
  onViewAll,
}: EmployeeAttentionListProps) {
  // Collect all employees and rank by QID urgency
  const employeeItems: UrgentEmployeeItem[] = employees.map((e) => {
    const regCompany = companies.find((c) => c.id === e.companyId) || e.company;
    const workCompany = e.currentWorkingCompanyId
      ? (companies.find((c) => c.id === e.currentWorkingCompanyId) || e.currentWorkingCompany)
      : null;

    return {
      id: e.id,
      employeeName: e.employeeName,
      role: e.role || 'EMPLOYEE',
      qidNumber: e.qidNumber,
      qidExpiry: e.qidExpiry,
      daysRemaining: getDaysRemaining(e.qidExpiry),
      status: calculateEmployeeQidStatus(e.qidExpiry),
      companyName: regCompany?.companyName || 'Unassigned Sponsor',
      workingCompanyName: workCompany && workCompany.id !== regCompany?.id ? workCompany.companyName : null,
      phone: e.phone,
    };
  });

  // Filter to prioritize non-SAFE employees first, then upcoming expirations
  const nonSafeEmployees = employeeItems.filter((e) => e.status !== 'SAFE');

  // Status priority for non-SAFE: MONTH_3_EXPIRED -> MONTH_2_EXPIRED -> MONTH_1_EXPIRED -> FULLY_EXPIRED
  const statusPriority: Record<EmployeeQidStatus, number> = {
    MONTH_3_EXPIRED: 1,
    MONTH_2_EXPIRED: 2,
    MONTH_1_EXPIRED: 3,
    FULLY_EXPIRED: 4,
    SAFE: 5,
  };

  nonSafeEmployees.sort((a, b) => {
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    return a.daysRemaining - b.daysRemaining;
  });

  // If no expired employees, display safe employees approaching their window
  const displayItems = nonSafeEmployees.length > 0 ? nonSafeEmployees.slice(0, 8) : employeeItems.slice(0, 6);

  const formatElapsedText = (days: number, status: EmployeeQidStatus) => {
    if (status === 'SAFE') {
      if (days === 0) return 'Expires Today';
      if (days === 1) return 'Expires Tomorrow';
      return `Valid (${days} days left)`;
    }
    const daysAgo = Math.abs(days);
    if (daysAgo <= 30) return `Expired ~1 month ago (${daysAgo}d)`;
    if (daysAgo <= 60) return `Expired ~2 months ago (${daysAgo}d)`;
    if (daysAgo <= 90) return `Expired ~3 months ago (${daysAgo}d)`;
    return `Expired ${daysAgo} days ago`;
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Employees Requiring Attention
          </h3>
          <p className="text-xs text-muted-foreground">
            Personnel sorted by QID expiration status and calendar-month grace timeline.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewAll} 
          className="text-xs h-8 rounded-xl font-semibold gap-1"
        >
          <span>View Staff Directory</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {displayItems.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border text-center space-y-1.5 shadow-xs">
          <p className="font-bold text-sm text-foreground">No Employees Registered</p>
          <p className="text-xs text-muted-foreground">Add staff members to track Qatar ID and visa expiry.</p>
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">QID Number</th>
                  <th className="px-4 py-3">Registered Company</th>
                  <th className="px-4 py-3">Working Company</th>
                  <th className="px-4 py-3">QID Expiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {displayItems.map((emp) => {
                  const meta = EMPLOYEE_STATUS_META[emp.status];
                  const isOwner = emp.role.toUpperCase() === 'OWNER';

                  return (
                    <tr 
                      key={emp.id} 
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      onClick={() => onOpenEmployee(emp.id)}
                    >
                      <td className="px-4 py-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {emp.employeeName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[160px]">{emp.employeeName}</span>
                            <span className={cn(
                              "px-1.5 py-0.2 rounded-md text-[9px] font-bold font-mono uppercase tracking-wider border",
                              isOwner ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-muted text-muted-foreground border-border"
                            )}>
                              {isOwner ? 'Owner' : 'Emp'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono font-semibold text-foreground">
                        {emp.qidNumber}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5 truncate max-w-[170px]" title={emp.companyName}>
                          <Building2 className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{emp.companyName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {emp.workingCompanyName ? (
                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 truncate max-w-[170px]" title={emp.workingCompanyName}>
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span className="truncate">{emp.workingCompanyName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-[11px]">Same as Sponsor</span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{formatDate(emp.qidExpiry)}</span>
                          <span className={cn(
                            "text-[10px]",
                            emp.status === 'SAFE' ? "text-emerald-600 dark:text-emerald-400" :
                            emp.status === 'MONTH_1_EXPIRED' ? "text-zinc-600 dark:text-zinc-400" :
                            emp.status === 'MONTH_2_EXPIRED' ? "text-amber-600 dark:text-amber-400" :
                            "text-rose-600 dark:text-rose-400"
                          )}>
                            {formatElapsedText(emp.daysRemaining, emp.status)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border whitespace-nowrap",
                          meta.badgeBg,
                          meta.badgeText,
                          meta.badgeBorder
                        )}>
                          {meta.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="text-primary group-hover:translate-x-0.5 inline-flex items-center gap-1 font-semibold text-[11px] transition-transform">
                          <span>Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="sm:hidden divide-y divide-border/60">
            {displayItems.map((emp) => {
              const meta = EMPLOYEE_STATUS_META[emp.status];
              const isOwner = emp.role.toUpperCase() === 'OWNER';

              return (
                <div
                  key={emp.id}
                  onClick={() => onOpenEmployee(emp.id)}
                  className="p-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors space-y-2.5 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-foreground truncate">{emp.employeeName}</h4>
                        <span className={cn(
                          "px-1.5 py-0.2 rounded-md text-[9px] font-bold font-mono uppercase tracking-wider border",
                          isOwner ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-muted text-muted-foreground border-border"
                        )}>
                          {isOwner ? 'Owner' : 'Emp'}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        QID: <strong className="text-foreground">{emp.qidNumber}</strong>
                      </p>
                    </div>

                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border whitespace-nowrap shrink-0",
                      meta.badgeBg,
                      meta.badgeText,
                      meta.badgeBorder
                    )}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-muted/30 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Registered Sponsor:</span>
                      <strong className="text-foreground truncate max-w-[170px]">{emp.companyName}</strong>
                    </div>
                    {emp.workingCompanyName && (
                      <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                        <span>Works at:</span>
                        <strong className="truncate max-w-[170px]">{emp.workingCompanyName}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Expiry: {formatDate(emp.qidExpiry)}</span>
                    <span className={cn(
                      "font-semibold",
                      emp.status === 'SAFE' ? "text-emerald-600 dark:text-emerald-400" :
                      emp.status === 'MONTH_1_EXPIRED' ? "text-zinc-600 dark:text-zinc-400" :
                      emp.status === 'MONTH_2_EXPIRED' ? "text-amber-600 dark:text-amber-400" :
                      "text-rose-600 dark:text-rose-400"
                    )}>
                      {formatElapsedText(emp.daysRemaining, emp.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
