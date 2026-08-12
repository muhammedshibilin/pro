'use client';

import React from 'react';
import { Company } from '@/types';
import { ChevronRight, Users, FileCheck, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { getDaysRemaining } from '@/lib/utils';

interface MobileCompanyCardProps {
  company: Company;
  onTap: (company: Company) => void;
}

export default function MobileCompanyCard({ company, onTap }: MobileCompanyCardProps) {
  const getStatusBadge = (dateString?: string | null, label?: string) => {
    if (!dateString) return null;
    const days = getDaysRemaining(dateString);
    if (days < 0) {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
          {label} Expired
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {label} in {days}d
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        {label} Valid
      </span>
    );
  };

  return (
    <div 
      className="w-full bg-card rounded-2xl border p-4 shadow-xs active:scale-[0.98] transition-transform space-y-3"
      onClick={() => onTap(company)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
            {company.companyName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate text-foreground">{company.companyName}</h3>
            <p className="text-xs text-muted-foreground truncate">{company.ownerName || 'Corporate Entity'}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
      </div>

      {/* CR & License Details */}
      <div className="p-2.5 rounded-xl bg-muted/30 space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <FileCheck className="h-3.5 w-3.5 text-blue-500" />
            CR: <strong className="text-foreground">{company.crNumber || '—'}</strong>
          </span>
          <div className="flex items-center gap-1">
            {company.crPhoto && <ImageIcon className="h-3 w-3 text-blue-500" />}
            {getStatusBadge(company.crExpiry, 'CR')}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Lic: <strong className="text-foreground">{company.licenseNumber || '—'}</strong>
          </span>
          <div className="flex items-center gap-1">
            {company.licensePhoto && <ImageIcon className="h-3 w-3 text-emerald-500" />}
            {getStatusBadge(company.licenseExpiry, 'Lic')}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs pt-1 border-t">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{company._count?.employees || 0} Staff</span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          {company.status}
        </span>
      </div>
    </div>
  );
}
