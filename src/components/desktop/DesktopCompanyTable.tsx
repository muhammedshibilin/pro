'use client';

import React, { useState } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { useDeleteCompany } from '@/hooks/use-companies';
import { DesktopFilterPanel } from './DesktopFilterPanel';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Edit3, Trash2, Phone, Users, FileCheck, ShieldCheck, Eye, CreditCard, User } from 'lucide-react';
import { CompanyFormModal } from '@/components/company-form-modal';
import { DeleteConfirmModal } from '@/components/delete-confirm-modal';
import { Company } from '@/types';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { 
  calculateCompanyDocumentStatus, 
  COMPANY_DOC_STATUS_META, 
  CompanyDocumentStatus 
} from '@/lib/status-calculator';
import { cn } from '@/lib/utils';

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

  const filterChips: { id: string; label: string; count: number; colorClass: string }[] = [
    { id: 'ALL', label: 'All Companies', count: companies.length, colorClass: 'bg-muted text-foreground' },
    { id: 'SAFE', label: '🟢 Safe (3+ Mo)', count: companyCounts.safe, colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
    { id: 'WARNING', label: '🟡 Warning (2 Mo)', count: companyCounts.warning, colorClass: 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold' },
    { id: 'DANGER', label: '🔴 Danger (<1 Mo / Exp)', count: companyCounts.danger, colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold' },
  ];

  return (
    <div className="flex flex-col w-full animate-fade-in space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-foreground">Company Registry</h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {companies.length} Accounts
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Corporate entities database tracking Commercial Registrations (CR), Trade Licenses, Computer Cards, and multi-company Owner profiles.
          </p>
        </div>

        <Button onClick={handleAdd} className="rounded-xl shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-4">
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* 3-Tier Status Filter Quick Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterChips.map((chip) => {
          const isSelected = (companyStatusFilter || 'ALL') === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setCompanyStatusFilter(chip.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-2",
                chip.colorClass,
                isSelected ? "ring-2 ring-primary font-bold shadow-xs scale-105" : "opacity-80 hover:opacity-100"
              )}
            >
              <span>{chip.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-mono">
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      <DesktopFilterPanel searchValue={search} onSearchChange={setSearch}>
        <Select 
          options={[
            {value: 'ALL', label: 'All Document Statuses'}, 
            {value: 'SAFE', label: '🟢 Safe (3+ Months Remaining)'}, 
            {value: 'WARNING', label: '🟡 Warning (2 Months Remaining)'}, 
            {value: 'DANGER', label: '🔴 Danger (Final Month or Expired)'}
          ]} 
          value={companyStatusFilter || 'ALL'} 
          onChange={(e) => setCompanyStatusFilter(e.target.value)} 
        />
      </DesktopFilterPanel>

      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3.5 flex items-center justify-between animate-fade-in">
          <span className="text-xs font-semibold text-primary font-mono">{selectedIds.length} companies selected</span>
          <Button variant="destructive" size="sm" onClick={() => setDeletingId('bulk')} className="rounded-lg h-8 text-xs font-semibold">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/60 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">
                  <input 
                    type="checkbox" 
                    onChange={(e) => handleSelectAll(e.target.checked)} 
                    checked={selectedIds.length === filtered.length && filtered.length > 0} 
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" 
                  />
                </th>
                <th className="px-4 py-3.5">Company Name</th>
                <th className="px-4 py-3.5">Owner / Person</th>
                <th className="px-4 py-3.5">CR Details</th>
                <th className="px-4 py-3.5">Trade License</th>
                <th className="px-4 py-3.5">Computer Card</th>
                <th className="px-4 py-3.5 text-center">Staff Count</th>
                <th className="px-4 py-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map(company => {
                const ownerDisplayName = company.owner?.name || company.ownerName || '—';

                return (
                  <tr key={company.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-4 py-3.5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(company.id)} 
                        onChange={() => toggleSelect(company.id)} 
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" 
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-primary/20 text-primary flex items-center justify-center font-display font-bold text-xs shrink-0 ring-1 ring-primary/20">
                          {company.companyName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{company.companyName}</span>
                          <span className="text-[10px] text-muted-foreground">{company.email || 'No email provided'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Owner / Responsible Person */}
                    <td className="px-4 py-3.5">
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
                    </td>

                    {/* CR Details */}
                    <td className="px-4 py-3.5">
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
                    </td>

                    {/* Trade License Details */}
                    <td className="px-4 py-3.5">
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
                    </td>

                    {/* Computer Card Details */}
                    <td className="px-4 py-3.5">
                      {company.computerCardNumber ? (
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
                      )}
                    </td>

                    {/* Staff Count */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-muted text-foreground border">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {company._count?.employees ?? 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
                          onClick={() => handleEdit(company)}
                          title="Edit Company"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                          onClick={() => setDeletingId(company.id)}
                          title="Delete Company"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    <p className="font-semibold text-sm">No companies found</p>
                    <p className="text-xs mt-1">Try refining your search query or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CompanyFormModal 
        company={editingCompany} 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />

      <DeleteConfirmModal 
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
              <Button variant="ghost" size="sm" onClick={() => setViewingPhoto(null)}>Close</Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingPhoto.url} alt={viewingPhoto.title} className="max-h-[70vh] w-auto mx-auto object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
