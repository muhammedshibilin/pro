'use client';

import React from 'react';
import { Company } from '@/types';
import { ChevronRight, Users, FileCheck, ShieldCheck, CreditCard, Image as ImageIcon, User, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDaysRemaining } from '@/lib/utils';
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
    if (!dateString) return null;
    const status = calculateCompanyDocumentStatus(dateString);
    const meta = COMPANY_DOC_STATUS_META[status];
    const days = getDaysRemaining(dateString);

    let detail = meta.label;
    if (status === 'WARNING') detail = `${days}d left`;
    else if (status === 'DANGER') detail = days < 0 ? 'Expired' : `${days}d left`;

    return (
      <span className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap border",
        meta.badgeBg,
        meta.badgeText,
        meta.badgeBorder
      )}>
        {detail}
      </span>
    );
  };

  const ownerName = company.owner?.name || company.ownerName;

  return (
    <div 
      className="w-full bg-card rounded-2xl border p-4 shadow-xs active:scale-[0.99] transition-all space-y-3 cursor-pointer hover:border-primary/30"
      onClick={() => onTap(company)}
    >
      {/* Header Row: Avatar, Name, Actions & Arrow */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 mt-0.5">
            {company.companyName ? company.companyName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base leading-snug text-foreground break-words">{company.companyName}</h3>
            {ownerName && (
              <p className="text-xs text-muted-foreground mt-0.5 break-words flex items-center gap-1">
                <User className="w-3 h-3 text-primary shrink-0" />
                <span>Owner: <strong className="text-foreground font-medium">{ownerName}</strong></span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
              }}
              title="Edit Company"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(company);
              }}
              title="Delete Company"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* CR, License, & Computer Card Details */}
      <div className="p-3 rounded-xl bg-muted/30 space-y-2 text-xs">
        {/* CR Row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <FileCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="truncate">CR: <strong className="font-mono text-foreground font-semibold break-all">{company.crNumber || '—'}</strong></span>
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {company.crPhoto && <ImageIcon className="h-3 w-3 text-blue-500 shrink-0" />}
            {renderDocBadge(company.crExpiry)}
          </div>
        </div>

        {/* License Row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
          <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Lic: <strong className="font-mono text-foreground font-semibold break-all">{company.licenseNumber || '—'}</strong></span>
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {company.licensePhoto && <ImageIcon className="h-3 w-3 text-emerald-500 shrink-0" />}
            {renderDocBadge(company.licenseExpiry)}
          </div>
        </div>

        {/* Computer Card Row */}
        {company.computerCardNumber && (
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
            <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <CreditCard className="h-3.5 w-3.5 text-purple-500 shrink-0" />
              <span className="truncate">CC: <strong className="font-mono text-foreground font-semibold break-all">{company.computerCardNumber}</strong></span>
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {company.computerCardPhoto && <ImageIcon className="h-3 w-3 text-purple-500 shrink-0" />}
              {renderDocBadge(company.licenseExpiry)}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Info: Staff Count and Active Status */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>{company._count?.employees || 0} Staff Monitored</span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          {company.status}
        </span>
      </div>
    </div>
  );
}
