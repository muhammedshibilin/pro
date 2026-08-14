'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { calculateCompanyDocumentStatus, CompanyDocumentStatus } from '@/lib/status-calculator';
import MobileCompanyCard from './MobileCompanyCard';
import MobileCompanyDetail from './MobileCompanyDetail';
import { Company } from '@/types';
import { cn } from '@/lib/utils';

interface MobileCompanyListProps {
  appData: AppData;
}

export default function MobileCompanyList({ appData }: MobileCompanyListProps) {
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { 
    companies, 
    companyCounts, 
    companyStatusFilter, 
    setCompanyStatusFilter 
  } = appData;

  const getCompanyOverallStatus = (c: Company): CompanyDocumentStatus => {
    const statuses: CompanyDocumentStatus[] = [];
    if (c.crExpiry) statuses.push(calculateCompanyDocumentStatus(c.crExpiry));
    if (c.licenseExpiry) statuses.push(calculateCompanyDocumentStatus(c.licenseExpiry));
    
    if (statuses.includes('DANGER')) return 'DANGER';
    if (statuses.includes('WARNING')) return 'WARNING';
    return 'SAFE';
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(comp => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (comp.companyName || '').toLowerCase().includes(q) ||
        (comp.crNumber || '').toLowerCase().includes(q) ||
        (comp.licenseNumber || '').toLowerCase().includes(q) ||
        (comp.ownerName || '').toLowerCase().includes(q) ||
        (comp.phone || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (companyStatusFilter && companyStatusFilter !== 'ALL') {
        const overall = getCompanyOverallStatus(comp);
        if (overall !== companyStatusFilter) return false;
      }

      return true;
    });
  }, [companies, search, companyStatusFilter]);

  if (selectedCompany) {
    return (
      <MobileCompanyDetail 
        company={selectedCompany} 
        onBack={() => setSelectedCompany(null)} 
      />
    );
  }

  const filterChips = [
    { id: 'ALL', label: 'All', count: companies.length, color: 'bg-muted text-muted-foreground' },
    { id: 'SAFE', label: '🟢 Safe', count: companyCounts.safe, color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
    { id: 'WARNING', label: '🟡 Warning', count: companyCounts.warning, color: 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold' },
    { id: 'DANGER', label: '🔴 Danger', count: companyCounts.danger, color: 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold' },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 space-y-3 border-b shadow-xs shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-foreground font-display flex items-center gap-2 truncate">
            <Building2 className="w-5 h-5 text-primary shrink-0" />
            <span>Company Registry</span>
          </h1>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
            {filteredCompanies.length} Shown
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, CR, license, owner..." 
            className="w-full h-11 pl-10 rounded-xl bg-muted/60 border-none text-sm"
          />
        </div>
        
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterChips.map((chip) => {
            const isSelected = (companyStatusFilter || 'ALL') === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setCompanyStatusFilter(chip.id)}
                className={cn(
                  "flex-shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5",
                  chip.color,
                  isSelected ? "ring-2 ring-primary font-bold shadow-xs scale-105" : "opacity-80 hover:opacity-100"
                )}
              >
                <span>{chip.label}</span>
                <span className="text-[10px] font-mono opacity-80">({chip.count})</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Cards List Feed */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))]">
        {filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
            <div className="w-14 h-14 bg-muted/80 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No companies found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or document status filter</p>
            </div>
          </div>
        ) : (
          filteredCompanies.map(comp => (
            <MobileCompanyCard 
              key={comp.id} 
              company={comp} 
              onTap={setSelectedCompany} 
            />
          ))
        )}
      </main>
    </div>
  );
}
