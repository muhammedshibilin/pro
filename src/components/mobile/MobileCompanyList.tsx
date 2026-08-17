'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Building2, FileCheck, ShieldCheck, CreditCard, User, Users, Calendar, AlertTriangle, Plus } from 'lucide-react';
import { calculateCompanyDocumentStatus, CompanyDocumentStatus, COMPANY_DOC_STATUS_META } from '@/lib/status-calculator';
import MobileCompanyDetail from './MobileCompanyDetail';
import MobileCompanyForm from './MobileCompanyForm';
import { useDeleteCompany } from '@/hooks/use-companies';
import { Company } from '@/types';
import { formatDate, getDaysRemaining, cn } from '@/lib/utils';
import {
  PageHeader,
  SearchFilterBar,
  EntityCard,
  ConfirmationDialog,
  StatusFilterOption,
} from '@/components/shared';

interface MobileCompanyListProps {
  appData: AppData;
  onAddCompany?: () => void;
}

export default function MobileCompanyList({ appData, onAddCompany }: MobileCompanyListProps) {
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  const deleteMutation = useDeleteCompany();

  const handleAddClick = () => {
    if (onAddCompany) {
      onAddCompany();
    } else {
      setIsCreatingCompany(true);
    }
  };

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
        (comp.computerCardNumber || '').toLowerCase().includes(q) ||
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

  // Calculate Next Expiry among CR and License (Computer Card shares License expiry)
  const getNextExpiry = (comp: Company) => {
    const items: { label: string; date: string; days: number }[] = [];
    if (comp.crExpiry) items.push({ label: 'CR', date: comp.crExpiry, days: getDaysRemaining(comp.crExpiry) });
    if (comp.licenseExpiry) items.push({ label: 'Trade License', date: comp.licenseExpiry, days: getDaysRemaining(comp.licenseExpiry) });

    if (items.length === 0) return null;

    items.sort((a, b) => a.days - b.days);
    const next = items[0];
    return next;
  };

  // Strictly 3 Company Status Filters (SAFE, WARNING, DANGER)
  const filterChips: StatusFilterOption[] = [
    { id: 'ALL', label: 'All', count: companies.length, variant: 'neutral' },
    { id: 'SAFE', label: '🟢 Safe', count: companyCounts.safe, variant: 'safe' },
    { id: 'WARNING', label: '🟡 Warning', count: companyCounts.warning, variant: 'warning' },
    { id: 'DANGER', label: '🔴 Danger', count: companyCounts.danger, variant: 'danger' },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Mobile Sticky Header Bar matching Employee structure */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 space-y-3 border-b shadow-xs shrink-0">
        <PageHeader
          title="Company Registry"
          icon={Building2}
          badgeCount={filteredCompanies.length}
          badgeLabel="Companies"
          primaryAction={{
            label: 'Add Company',
            icon: Plus,
            onClick: handleAddClick,
          }}
          className="p-2.5 border-none shadow-none bg-transparent"
        />

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search companies..."
          statusFilters={filterChips}
          activeStatusFilter={companyStatusFilter || 'ALL'}
          onStatusFilterChange={setCompanyStatusFilter}
        />
      </header>

      {/* Cards List Feed with 80px bottom safe clearance */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        {filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
            <div className="w-14 h-14 bg-muted/80 rounded-2xl flex items-center justify-center border shrink-0">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No companies found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or status filter</p>
            </div>
          </div>
        ) : (
          filteredCompanies.map(comp => {
            const ownerName = comp.owner?.name || comp.ownerName;
            const overallStatus = getCompanyOverallStatus(comp);
            const overallMeta = COMPANY_DOC_STATUS_META[overallStatus];
            const nextExpiry = getNextExpiry(comp);

            return (
              <EntityCard
                key={comp.id}
                title={comp.companyName}
                avatarIcon={Building2}
                statusBadge={
                  /* Overall Status: 🟢 Safe, 🟡 Warning, 🔴 Danger */
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap border shrink-0 leading-normal",
                    overallMeta.badgeBg,
                    overallMeta.badgeText,
                    overallMeta.badgeBorder
                  )}>
                    {overallMeta.label}
                  </span>
                }
                subtitle={
                  <div className="space-y-1 mt-1 text-xs text-muted-foreground">
                    {ownerName && (
                      <p className="break-words flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Owner: <strong className="text-foreground font-semibold">{ownerName}</strong></span>
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{comp._count?.employees || 0} Employees Monitored</span>
                    </div>
                  </div>
                }
                details={
                  <div className="space-y-2.5">
                    {/* CR, License, Computer Card Document Status Box */}
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs font-mono">
                      {/* CR Status */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                          <FileCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>CR: <strong className="text-foreground font-semibold break-all">{comp.crNumber || '—'}</strong></span>
                        </span>
                        <div>{renderDocBadge(comp.crExpiry)}</div>
                      </div>

                      {/* License Status */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
                        <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>License: <strong className="text-foreground font-semibold break-all">{comp.licenseNumber || '—'}</strong></span>
                        </span>
                        <div>{renderDocBadge(comp.licenseExpiry)}</div>
                      </div>

                      {/* Computer Card Status (Expiry is the same as License expiry) */}
                      {comp.computerCardNumber && (
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
                          <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                            <CreditCard className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                            <span>Computer Card: <strong className="text-foreground font-semibold break-all">{comp.computerCardNumber}</strong></span>
                          </span>
                          {/* Shares License Expiry */}
                          <div>{renderDocBadge(comp.licenseExpiry)}</div>
                        </div>
                      )}
                    </div>

                    {/* Next Expiry Highlight Card */}
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
                }
                onTap={() => setSelectedCompany(comp)}
                onEdit={() => setEditingCompany(comp)}
                onDelete={() => setDeletingCompany(comp)}
              />
            );
          })
        )}
      </main>

      {isCreatingCompany && (
        <MobileCompanyForm onBack={() => setIsCreatingCompany(false)} />
      )}

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
