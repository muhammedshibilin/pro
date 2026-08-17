'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Building2, FileCheck, ShieldCheck, CreditCard, User, ImageIcon } from 'lucide-react';
import { calculateCompanyDocumentStatus, CompanyDocumentStatus, COMPANY_DOC_STATUS_META } from '@/lib/status-calculator';
import MobileCompanyDetail from './MobileCompanyDetail';
import MobileCompanyForm from './MobileCompanyForm';
import { useDeleteCompany } from '@/hooks/use-companies';
import { Company } from '@/types';
import { getDaysRemaining, cn } from '@/lib/utils';
import {
  PageHeader,
  SearchFilterBar,
  EntityCard,
  ConfirmationDialog,
  StatusFilterOption,
} from '@/components/shared';

interface MobileCompanyListProps {
  appData: AppData;
}

export default function MobileCompanyList({ appData }: MobileCompanyListProps) {
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  const deleteMutation = useDeleteCompany();

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

  const handleDeleteConfirm = async () => {
    if (deletingCompany) {
      await deleteMutation.mutateAsync(deletingCompany.id);
      setDeletingCompany(null);
    }
  };

  if (selectedCompany) {
    return (
      <MobileCompanyDetail 
        company={selectedCompany} 
        onBack={() => setSelectedCompany(null)} 
      />
    );
  }

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

  const filterChips: StatusFilterOption[] = [
    { id: 'ALL', label: 'All', count: companies.length, variant: 'neutral' },
    { id: 'SAFE', label: '🟢 Safe', count: companyCounts.safe, variant: 'safe' },
    { id: 'WARNING', label: '🟡 Warning', count: companyCounts.warning, variant: 'warning' },
    { id: 'DANGER', label: '🔴 Danger', count: companyCounts.danger, variant: 'danger' },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 space-y-3 border-b shadow-xs shrink-0">
        <PageHeader
          title="Company Registry"
          icon={Building2}
          badgeCount={filteredCompanies.length}
          badgeLabel="Shown"
          className="p-3 border-none shadow-none bg-transparent"
        />

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search company, CR, license, owner..."
          statusFilters={filterChips}
          activeStatusFilter={companyStatusFilter || 'ALL'}
          onStatusFilterChange={setCompanyStatusFilter}
        />
      </header>

      {/* Cards List Feed */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))]">
        {filteredCompanies.map(comp => {
          const ownerName = comp.owner?.name || comp.ownerName;

          return (
            <EntityCard
              key={comp.id}
              title={comp.companyName}
              subtitle={
                ownerName ? (
                  <p className="text-xs text-muted-foreground mt-0.5 break-words flex items-center gap-1">
                    <User className="w-3 h-3 text-primary shrink-0" />
                    <span>Owner: <strong className="text-foreground font-medium">{ownerName}</strong></span>
                  </p>
                ) : undefined
              }
              statusBadge={
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {comp.status}
                </span>
              }
              details={
                <div className="p-3 rounded-xl bg-muted/30 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                      <FileCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">CR: <strong className="font-mono text-foreground font-semibold break-all">{comp.crNumber || '—'}</strong></span>
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {comp.crPhoto && <ImageIcon className="h-3 w-3 text-blue-500 shrink-0" />}
                      {renderDocBadge(comp.crExpiry)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
                    <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">Lic: <strong className="font-mono text-foreground font-semibold break-all">{comp.licenseNumber || '—'}</strong></span>
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {comp.licensePhoto && <ImageIcon className="h-3 w-3 text-emerald-500 shrink-0" />}
                      {renderDocBadge(comp.licenseExpiry)}
                    </div>
                  </div>

                  {comp.computerCardNumber && (
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
                      <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                        <CreditCard className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">CC: <strong className="font-mono text-foreground font-semibold break-all">{comp.computerCardNumber}</strong></span>
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {comp.computerCardPhoto && <ImageIcon className="h-3 w-3 text-purple-500 shrink-0" />}
                        {renderDocBadge(comp.licenseExpiry)}
                      </div>
                    </div>
                  )}
                </div>
              }
              onTap={() => setSelectedCompany(comp)}
              onEdit={() => setEditingCompany(comp)}
              onDelete={() => setDeletingCompany(comp)}
            />
          );
        })}
      </main>

      {editingCompany && (
        <MobileCompanyForm company={editingCompany} onBack={() => setEditingCompany(null)} />
      )}

      <ConfirmationDialog
        open={!!deletingCompany}
        onOpenChange={(open) => !open && setDeletingCompany(null)}
        title="Delete Corporate Account"
        description={`Are you sure you want to delete ${deletingCompany?.companyName}? All associated employees and documents will be permanently removed.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
