'use client';

import React from 'react';
import { Employee } from '@/types';
import { ChevronRight, Phone, CreditCard, BookOpen, Image as ImageIcon, Building2, Briefcase } from 'lucide-react';
import { getDaysRemaining } from '@/lib/utils';
import { 
  calculateEmployeeQidStatus, 
  EMPLOYEE_STATUS_META 
} from '@/lib/status-calculator';
import { cn } from '@/lib/utils';

interface MobileEmployeeCardProps {
  employee: Employee;
  onTap: (employee: Employee) => void;
}

export default function MobileEmployeeCard({ employee, onTap }: MobileEmployeeCardProps) {
  const initials = (employee.employeeName || 'EM').substring(0, 2).toUpperCase();

  const qidStatus = calculateEmployeeQidStatus(employee.qidExpiry);
  const qidMeta = EMPLOYEE_STATUS_META[qidStatus];
  const qidDays = getDaysRemaining(employee.qidExpiry);
  const isOwner = employee.role?.toUpperCase() === 'OWNER';

  const getPassportBadge = (dateString?: string | null) => {
    if (!dateString) return null;
    const days = getDaysRemaining(dateString);
    if (days < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap bg-rose-500/10 text-rose-600 border border-rose-500/20">
          Expired
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {days}d left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium whitespace-nowrap bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        Valid
      </span>
    );
  };

  return (
    <div 
      className="w-full bg-card rounded-2xl border p-4 shadow-xs active:scale-[0.99] transition-all space-y-3 cursor-pointer hover:border-primary/30"
      onClick={() => onTap(employee)}
    >
      {/* Header Row: Initials & Employee / Company Names */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 mt-0.5">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-base leading-snug text-foreground break-words">{employee.employeeName}</h3>
              <span className={cn(
                "px-1.5 py-0.2 rounded-md text-[9px] font-bold font-mono uppercase tracking-wider border",
                isOwner ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-muted text-muted-foreground border-border"
              )}>
                {isOwner ? 'Owner' : 'Employee'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 break-words">
              <Building2 className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{employee.company?.companyName || 'Unassigned Sponsor'}</span>
            </div>

            {employee.currentWorkingCompany && employee.currentWorkingCompanyId !== employee.companyId && (
              <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5 break-words">
                <Briefcase className="w-3 h-3 shrink-0" />
                <span className="truncate">Works at: {employee.currentWorkingCompany.companyName}</span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
      </div>

      {/* Contact Number */}
      {employee.phone && (
        <div className="flex items-center gap-2 text-xs font-mono text-foreground bg-muted/20 px-3 py-1.5 rounded-xl break-all">
          <Phone className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>{employee.phone}</span>
        </div>
      )}

      {/* QID & Passport Tracking Pills */}
      <div className="p-3 rounded-xl bg-muted/30 space-y-2 text-xs font-mono">
        {/* QID Row with 4-Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="truncate">QID: <strong className="text-foreground font-semibold break-all">{employee.qidNumber}</strong></span>
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {employee.qidPhoto && <ImageIcon className="h-3 w-3 text-blue-500 shrink-0" />}
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap border",
              qidMeta.badgeBg,
              qidMeta.badgeText,
              qidMeta.badgeBorder
            )}>
              {qidMeta.shortLabel} {qidStatus !== 'SAFE' && `(${Math.abs(qidDays)}d)`}
            </span>
          </div>
        </div>

        {/* Passport Row */}
        {employee.passportNumber && (
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
            <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <BookOpen className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Pass: <strong className="text-foreground font-semibold break-all">{employee.passportNumber}</strong></span>
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {employee.passportPhoto && <ImageIcon className="h-3 w-3 text-emerald-500 shrink-0" />}
              {getPassportBadge(employee.passportExpiry)}
            </div>
          </div>
        )}
      </div>

      {/* Footer Row: Notes & Status */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 gap-2">
        <span className="text-[11px] text-muted-foreground truncate flex-1 min-w-0">{employee.notes || 'Staff Record'}</span>
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0",
          qidMeta.badgeBg,
          qidMeta.badgeText,
          qidMeta.badgeBorder
        )}>
          {qidMeta.label}
        </span>
      </div>
    </div>
  );
}
