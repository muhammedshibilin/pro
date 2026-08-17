'use client';

import React, { useState } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { useDeleteCompany } from '@/hooks/use-companies';
import { Select } from '@/components/ui/select';
import { Plus, Phone, Users, FileCheck, ShieldCheck, Eye, CreditCard, User, Building2 } from 'lucide-react';
import { CompanyFormModal } from '@/components/company-form-modal';
import { Company } from '@/types';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { 
  calculateCompanyDocumentStatus, 
  COMPANY_DOC_STATUS_META, 
  CompanyDocumentStatus 
} from '@/lib/status-calculator';
import { cn } from '@/lib/utils';
import {
  PageHeader,
  SearchFilterBar,
  DataTable,
  ActionMenu,
  ConfirmationDialog,
  StatusFilterOption,
  Column,
} from '@/components/shared';

interface DesktopCompanyTableProps {
  appData: AppData;
}

export function DesktopCompanyTable({ appData }: DesktopCompanyTableProps) {
  const { 
    companies, 
    companyCounts, 
    companyStatusFilter, 
    setCompanyStatusFilter 
  } = appData;
  const deleteMutation = useDeleteCompany();
  
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);

  const handleAdd = () => {
    setEditingCompany(undefined);
    setIsFormOpen(true);
  };
  
  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (deletingId) {
      if (deletingId !== 'bulk') await deleteMutation.mutateAsync(deletingId);
      else if (selectedIds.length > 0) {
        for (const id of selectedIds) {
          await deleteMutation.mutateAsync(id);
        }
        setSelectedIds([]);
      }
      setDeletingId(null);
    }
  };

  const getCompanyOverallStatus = (c: Company): CompanyDocumentStatus => {
    const statuses: CompanyDocumentStatus[] = [];
    if (c.crExpiry) statuses.push(calculateCompanyDocumentStatus(c.crExpiry));
    if (c.licenseExpiry) statuses.push(calculateCompanyDocumentStatus(c.licenseExpiry));
    if (c.computerCardNumber && c.licenseExpiry) statuses.push(calculateCompanyDocumentStatus(c.licenseExpiry));
    
    if (statuses.includes('DANGER')) return 'DANGER';
    if (statuses.includes('WARNING')) return 'WARNING';
    return 'SAFE';
  };

  const filtered = companies.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      (c.companyName || '').toLowerCase().includes(q) ||
      (c.crNumber || '').toLowerCase().includes(q) ||
      (c.licenseNumber || '').toLowerCase().includes(q) ||
      (c.computerCardNumber || '').toLowerCase().includes(q) ||
      (c.ownerName || '').toLowerCase().includes(q) ||
      (c.owner?.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (companyStatusFilter && companyStatusFilter !== 'ALL') {
      const overall = getCompanyOverallStatus(c);
      if (overall !== companyStatusFilter) return false;
    }

    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filtered.map(c => c.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderCompanyDocBadge = (dateString?: string | null) => {
    if (!dateString) return <span className="text-muted-foreground italic text-[10px]">No Expiry Set</span>;
    const status = calculateCompanyDocumentStatus(dateString);
    const meta = COMPANY_DOC_STATUS_META[status];
    const days = getDaysRemaining(dateString);

    let detailText = '';
    if (status === 'SAFE') {
      detailText = `Valid (${formatDate(dateString)})`;
    } else if (status === 'WARNING') {
      detailText = `Warning (${days}d left)`;
    } else {
      detailText = days < 0 ? `Expired (${Math.abs(days)}d ago)` : `Danger (${days}d left)`;
    }

    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border whitespace-nowrap",
        meta.badgeBg,
        meta.badgeText,
        meta.badgeBorder
      )}>
        {detailText}
      </span>
    );
  };

  const filterChips: StatusFilterOption[] = [
    { id: 'ALL', label: 'All Companies', count: companies.length, variant: 'neutral' },
    { id: 'SAFE', label: '🟢 Safe (3+ Mo)', count: companyCounts.safe, variant: 'safe' },
    { id: 'WARNING', label: '🟡 Warning (2 Mo)', count: companyCounts.warning, variant: 'warning' },
    { id: 'DANGER', label: '🔴 Danger (<1 Mo / Exp)', count: companyCounts.danger, variant: 'danger' },
  ];

  const columns: Column<Company>[] = [
    {
      key: 'companyName',
      header: 'Company Name',
      render: (company) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-primary/20 text-primary flex items-center justify-center font-display font-bold text-xs shrink-0 ring-1 ring-primary/20">
            {company.companyName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
              {company.companyName}
            </span>
            <span className="text-[10px] text-muted-foreground">{company.email || 'No email provided'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner / Person',
      render: (company) => {
        const ownerDisplayName = company.owner?.name || company.ownerName || '—';
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground flex items-center gap-1">
              <User className="w-3 h-3 text-primary shrink-0" />
              <span>{ownerDisplayName}</span>
            </span>
            {company.phone && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{company.phone}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'cr',
      header: 'CR Details',
      render: (company) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
            <FileCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>{company.crNumber || '—'}</span>
            {company.crPhoto && (
              <button
                type="button"
                onClick={() => setViewingPhoto({ url: company.crPhoto!, title: `${company.companyName} — CR Document` })}
                className="text-primary hover:text-primary/80 transition-colors"
                title="View CR Document Photo"
              >
                <Eye className="h-3.5 w-3.5 text-blue-500 hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
          <div>{renderCompanyDocBadge(company.crExpiry)}</div>
        </div>
      ),
    },
    {
      key: 'license',
      header: 'Trade License',
      render: (company) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>{company.licenseNumber || '—'}</span>
            {company.licensePhoto && (
              <button
                type="button"
                onClick={() => setViewingPhoto({ url: company.licensePhoto!, title: `${company.companyName} — Trade License` })}
                className="text-primary hover:text-primary/80 transition-colors"
                title="View Trade License Photo"
              >
                <Eye className="h-3.5 w-3.5 text-emerald-500 hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
          <div>{renderCompanyDocBadge(company.licenseExpiry)}</div>
        </div>
      ),
    },
    {
      key: 'computerCard',
      header: 'Computer Card',
      render: (company) => (
        company.computerCardNumber ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
              <CreditCard className="h-3.5 w-3.5 text-purple-500 shrink-0" />
              <span>{company.computerCardNumber}</span>
              {company.computerCardPhoto && (
                <button
                  type="button"
                  onClick={() => setViewingPhoto({ url: company.computerCardPhoto!, title: `${company.companyName} — Computer Card` })}
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="View Computer Card Photo"
                >
                  <Eye className="h-3.5 w-3.5 text-purple-500 hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
            <div>{renderCompanyDocBadge(company.licenseExpiry)}</div>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-[11px]">No Computer Card</span>
        )
      ),
    },
    {
      key: 'staffCount',
      header: 'Staff Count',
      className: 'text-center',
      render: (company) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-muted text-foreground border">
          <Users className="h-3 w-3 text-muted-foreground" />
          {company._count?.employees ?? 0}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right pr-6',
      render: (company) => (
        <ActionMenu
          onEdit={() => handleEdit(company)}
          onDelete={() => setDeletingId(company.id)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full animate-fade-in space-y-6">
      {/* Top Page Header with Top-Right Primary Action */}
      <PageHeader
        title="Company Registry"
        description="Corporate entities database tracking Commercial Registrations (CR), Trade Licenses, Computer Cards, and multi-company Owner profiles."
        icon={Building2}
        badgeCount={companies.length}
        badgeLabel="Accounts"
        primaryAction={{
          label: 'Add Company',
          icon: Plus,
          onClick: handleAdd,
        }}
      />

      {/* Search & Status Filter Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search company name, CR, license, computer card, owner..."
        statusFilters={filterChips}
        activeStatusFilter={companyStatusFilter || 'ALL'}
        onStatusFilterChange={setCompanyStatusFilter}
      >
        <Select 
          options={[
            {value: 'ALL', label: 'All Document Statuses'}, 
            {value: 'SAFE', label: '🟢 Safe (3+ Months Remaining)'}, 
            {value: 'WARNING', label: '🟡 Warning (2 Months Remaining)'}, 
            {value: 'DANGER', label: '🔴 Danger (Final Month or Expired)'}
          ]} 
          value={companyStatusFilter || 'ALL'} 
          onChange={(e) => setCompanyStatusFilter(e.target.value)} 
          className="h-11 rounded-xl border-border/80 text-xs bg-card"
        />
      </SearchFilterBar>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onToggleSelect={toggleSelect}
        onBulkDelete={() => setDeletingId('bulk')}
        emptyTitle="No companies found"
        emptyDescription="Try refining your search query or status filter."
      />

      {/* Modals */}
      <CompanyFormModal 
        company={editingCompany} 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />

      <ConfirmationDialog 
        open={!!deletingId} 
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Corporate Account"
        description="Are you sure you want to delete this company? All associated employees and documents will be permanently removed."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* Full Photo Modal Viewer */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingPhoto(null)}>
          <div className="bg-card border rounded-2xl max-w-2xl w-full p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm truncate text-foreground">{viewingPhoto.title}</span>
              <button className="text-xs text-muted-foreground hover:text-foreground font-semibold" onClick={() => setViewingPhoto(null)}>Close</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingPhoto.url} alt={viewingPhoto.title} className="max-h-[70vh] w-auto mx-auto object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
