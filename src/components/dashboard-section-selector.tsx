'use client';

import React from 'react';
import { Company } from '@/types';
import { Building2, Users, Layers, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DashboardSectionTab = 'ALL' | 'COMPANIES' | 'EMPLOYEES';

interface DashboardSectionSelectorProps {
  activeSection: DashboardSectionTab;
  onSelectSection: (section: DashboardSectionTab) => void;
  selectedCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  companies: Company[];
  totalCompanyCount: number;
  totalEmployeeCount: number;
  companyDangerCount: number;
  employeeExpiredCount: number;
}

export function DashboardSectionSelector({
  activeSection,
  onSelectSection,
  selectedCompanyId,
  onSelectCompany,
  companies,
  totalCompanyCount,
  totalEmployeeCount,
  companyDangerCount,
  employeeExpiredCount,
}: DashboardSectionSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-muted/40 border border-border/80 rounded-2xl">
      {/* 1. SECTION SWITCHER TABS */}
      <div className="flex items-center gap-1.5 p-1 bg-background/90 rounded-xl border border-border/60 shadow-2xs overflow-x-auto shrink-0">
        {/* All Tab */}
        <button
          type="button"
          onClick={() => onSelectSection('ALL')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer",
            activeSection === 'ALL'
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Overview</span>
        </button>

        {/* Company Documents Tab */}
        <button
          type="button"
          onClick={() => onSelectSection('COMPANIES')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer",
            activeSection === 'COMPANIES'
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Company Documents</span>
          <span className={cn(
            "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
            activeSection === 'COMPANIES' ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {totalCompanyCount}
          </span>
          {companyDangerCount > 0 && (
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" title={`${companyDangerCount} urgent documents`} />
          )}
        </button>

        {/* Employees Tab */}
        <button
          type="button"
          onClick={() => onSelectSection('EMPLOYEES')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer",
            activeSection === 'EMPLOYEES'
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Employees QID</span>
          <span className={cn(
            "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
            activeSection === 'EMPLOYEES' ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {totalEmployeeCount}
          </span>
          {employeeExpiredCount > 0 && (
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" title={`${employeeExpiredCount} expired QIDs`} />
          )}
        </button>
      </div>

      {/* 2. COMPANY SCOPE SELECTOR DROPDOWN */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative flex-1 sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <select
            value={selectedCompanyId}
            onChange={(e) => onSelectCompany(e.target.value)}
            className="w-full h-9 pl-8 pr-7 py-1 text-xs font-semibold bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring truncate cursor-pointer"
          >
            <option value="ALL">🏢 All Companies ({companies.length})</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        {selectedCompanyId !== 'ALL' && (
          <button
            type="button"
            onClick={() => onSelectCompany('ALL')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Clear company filter"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
