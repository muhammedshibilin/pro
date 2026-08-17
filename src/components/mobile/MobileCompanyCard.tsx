'use client';

import React from 'react';
import { Company } from '@/types';
import { ChevronRight, Users, FileCheck, ShieldCheck, CreditCard, User, Edit3, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDaysRemaining, formatDate } from '@/lib/utils';
import { 
  calculateCompanyDocumentStatus, 
  COMPANY_DOC_STATUS_META 
} from '@/lib/status-calculator';
import { cn } from '@/lib/utils';

interface MobileCompanyCardProps {
  company: Company;
  onTap: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
}

export default function MobileCompanyCard({ company, onTap, onEdit, onDelete }: MobileCompanyCardProps) {
  const renderDocBadge = (dateString?: string | null) => {
    if (!dateString) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground bg-muted/60 border">
          No Expiry
        </span>
      );
    }
    const status = calculateCompanyDocumentStatus(dateString);
    const meta = COMPANY_DOC_STATUS_META[status];
    const days = getDaysRemaining(dateString);

    let detail = meta.label;
    if (status === 'WARNING') detail = `${days}d left`;
    else if (status === 'DANGER') detail = days < 0 ? `Expired (${Math.abs(days)}d)` : `${days}d left`;

    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap border shrink-0 leading-normal",
        meta.badgeBg,
        meta.badgeText,
        meta.badgeBorder
      )}>
        {detail}
      </span>
    );
  };

  const ownerName = company.owner?.name || company.ownerName;

  // Compute Overall Status (SAFE, WARNING, DANGER)
  const statuses = [];
  if (company.crExpiry) statuses.push(calculateCompanyDocumentStatus(company.crExpiry));
  if (company.licenseExpiry) statuses.push(calculateCompanyDocumentStatus(company.licenseExpiry));
  const overallStatus = statuses.includes('DANGER') ? 'DANGER' : statuses.includes('WARNING') ? 'WARNING' : 'SAFE';
  const overallMeta = COMPANY_DOC_STATUS_META[overallStatus];

  // Calculate Next Expiry (CR or License/Computer Card)
  const getNextExpiry = () => {
    const items: { label: string; date: string; days: number }[] = [];
    if (company.crExpiry) items.push({ label: 'CR', date: company.crExpiry, days: getDaysRemaining(company.crExpiry) });
    if (company.licenseExpiry) items.push({ label: 'Trade License', date: company.licenseExpiry, days: getDaysRemaining(company.licenseExpiry) });
    if (items.length === 0) return null;
    items.sort((a, b) => a.days - b.days);
    return items[0];
  };

  const nextExpiry = getNextExpiry();

  return (
    <div 
      className="w-full bg-card rounded-2xl border p-4 shadow-xs active:scale-[0.99] transition-all space-y-3.5 cursor-pointer hover:border-primary/30"
      onClick={() => onTap(company)}
    >
      {/* Header Row: Avatar, Name, Owner, Overall Status & 44px Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 mt-0.5">
            {company.companyName ? company.companyName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-bold text-base leading-snug text-foreground break-words">{company.companyName}</h3>
            {ownerName && (
              <p className="text-xs text-muted-foreground break-words flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Owner: <strong className="text-foreground font-semibold">{ownerName}</strong></span>
              </p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{company._count?.employees || 0} Employees Monitored</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-1 shrink-0">
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap border shrink-0 leading-normal",
            overallMeta.badgeBg,
            overallMeta.badgeText,
            overallMeta.badgeBorder
          )}>
            {overallMeta.label}
          </span>
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
              }}
              title="Edit Company"
              aria-label="Edit Company"
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
                onDelete(company);
              }}
              title="Delete Company"
              aria-label="Delete Company"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <div className="h-11 w-6 min-h-[44px] flex items-center justify-center text-muted-foreground shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CR, License, & Computer Card Details */}
      <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs font-mono">
        {/* CR Row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <FileCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>CR: <strong className="text-foreground font-semibold break-all">{company.crNumber || '—'}</strong></span>
          </span>
          <div>{renderDocBadge(company.crExpiry)}</div>
        </div>

        {/* License Row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
          <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>License: <strong className="text-foreground font-semibold break-all">{company.licenseNumber || '—'}</strong></span>
          </span>
          <div>{renderDocBadge(company.licenseExpiry)}</div>
        </div>

        {/* Computer Card Row (Computer Card expiry is the same as License expiry) */}
        {company.computerCardNumber && (
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
            <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <CreditCard className="h-3.5 w-3.5 text-purple-500 shrink-0" />
              <span>Computer Card: <strong className="text-foreground font-semibold break-all">{company.computerCardNumber}</strong></span>
            </span>
            <div>{renderDocBadge(company.licenseExpiry)}</div>
          </div>
        )}
      </div>
      
      {/* Next Expiry Row */}
      {nextExpiry && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-primary min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              Next Expiry ({nextExpiry.label}): <strong>{formatDate(nextExpiry.date)}</strong>
            </span>
          </div>
          <span className={cn(
            "px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ml-2",
            nextExpiry.days < 0 ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : "bg-primary/10 text-primary border border-primary/20"
          )}>
            {nextExpiry.days < 0 ? `Expired (${Math.abs(nextExpiry.days)}d)` : `${nextExpiry.days}d left`}
          </span>
        </div>
      )}
    </div>
  );
}
