'use client';

import React from 'react';
import { Employee } from '@/types';
import { ChevronRight, Phone, CreditCard, BookOpen, Image as ImageIcon, Building2, Briefcase, Edit3, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDaysRemaining, formatDate } from '@/lib/utils';
import { 
  calculateEmployeeQidStatus, 
  EMPLOYEE_STATUS_META 
} from '@/lib/status-calculator';
import { cn } from '@/lib/utils';

interface MobileEmployeeCardProps {
  employee: Employee;
  onTap: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export default function MobileEmployeeCard({ employee, onTap, onEdit, onDelete }: MobileEmployeeCardProps) {
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
      className="w-full bg-card rounded-2xl border p-4 shadow-xs active:scale-[0.99] transition-all space-y-3.5 cursor-pointer hover:border-primary/30"
      onClick={() => onTap(employee)}
    >
      {/* Header Row: Initials, Employee / Company Names & Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 mt-0.5">
            {initials}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base leading-snug text-foreground break-words">{employee.employeeName}</h3>
              <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider border shrink-0",
                isOwner ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-muted text-muted-foreground border-border"
              )}>
                {isOwner ? 'Owner' : 'Employee'}
              </span>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-start gap-1.5 break-words">
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="break-words">
                  Sponsor: <strong className="text-foreground font-semibold">{employee.company?.companyName || 'Unassigned Sponsor'}</strong>
                </span>
              </div>
              {employee.currentWorkingCompany && employee.currentWorkingCompanyId !== employee.companyId && (
                <div className="flex items-start gap-1.5 text-blue-600 dark:text-blue-400 font-medium break-words">
                  <Briefcase className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="break-words">Works at: <strong>{employee.currentWorkingCompany.companyName}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 44px Touch Target Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(employee);
              }}
              title="Edit Employee"
              aria-label="Edit Employee"
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
                onDelete(employee);
              }}
              title="Delete Employee"
              aria-label="Delete Employee"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <div className="h-11 w-6 min-h-[44px] flex items-center justify-center text-muted-foreground shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* QID & Passport Details Card */}
      <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="font-mono text-muted-foreground">
              QID: <strong className="text-foreground font-bold font-mono break-all">{employee.qidNumber}</strong>
            </span>
          </div>
          
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap border shrink-0 leading-normal",
            qidMeta.badgeBg,
            qidMeta.badgeText,
            qidMeta.badgeBorder
          )}>
            {qidMeta.label} {qidStatus !== 'SAFE' && employee.qidExpiry && `(${Math.abs(qidDays)}d)`}
          </span>
        </div>

        {employee.qidExpiry && (
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border/40 font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
              <span>QID Expiry Date:</span>
            </span>
            <span className="font-semibold text-foreground">{formatDate(employee.qidExpiry)}</span>
          </div>
        )}

        {employee.passportNumber && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border/40 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <BookOpen className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Passport: <strong className="text-foreground font-semibold break-all">{employee.passportNumber}</strong></span>
            </span>
            <div className="shrink-0">{getPassportBadge(employee.passportExpiry)}</div>
          </div>
        )}
      </div>

      {employee.phone && (
        <div className="flex items-center gap-2 text-xs font-mono text-foreground bg-muted/20 px-3 py-2 rounded-xl break-all">
          <Phone className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>{employee.phone}</span>
        </div>
      )}
    </div>
  );
}
