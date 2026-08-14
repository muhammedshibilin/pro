'use client';

import React, { useState } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { useDeleteCompany } from '@/hooks/use-companies';
import { DesktopFilterPanel } from './DesktopFilterPanel';
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Trash2, Mail, Phone, Users, FileCheck, ShieldCheck, Eye, Cloud } from 'lucide-react';
import { CompanyFormModal } from '@/components/company-form-modal';
import { DeleteConfirmModal } from '@/components/delete-confirm-modal';
import { Company } from '@/types';
import { formatDate, getDaysRemaining } from '@/lib/utils';

interface DesktopCompanyTableProps {
  appData: AppData;
}

export function DesktopCompanyTable({ appData }: DesktopCompanyTableProps) {
  const { companies } = appData;
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

  const filtered = companies.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.companyName || '').toLowerCase().includes(q) ||
      (c.crNumber || '').toLowerCase().includes(q) ||
      (c.licenseNumber || '').toLowerCase().includes(q) ||
      (c.ownerName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filtered.map(c => c.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderExpiryBadge = (dateString?: string | null) => {
    if (!dateString) return <span className="text-muted-foreground italic text-[10px]">No Expiry Set</span>;
    const days = getDaysRemaining(dateString);
    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          Expired ({Math.abs(days)}d ago)
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          {days}d left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        Valid ({formatDate(dateString)})
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full animate-fade-in space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-foreground">Company Registry</h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {companies.length} Registered
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Corporate entity registry tracking Commercial Registrations (CR), Trade Licenses, and Cloudinary photos.
          </p>
        </div>

        <Button onClick={handleAdd} className="rounded-xl shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-4">
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>

      <DesktopFilterPanel searchValue={search} onSearchChange={setSearch} />

      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3.5 flex items-center justify-between animate-fade-in">
          <span className="text-xs font-semibold text-primary font-mono">{selectedIds.length} entities selected</span>
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
                <th className="px-4 py-3.5">Company Entity</th>
                <th className="px-4 py-3.5">Commercial Reg (CR)</th>
                <th className="px-4 py-3.5">Trade License</th>
                <th className="px-4 py-3.5">Authorized Officer</th>
                <th className="px-4 py-3.5">Staff Count</th>
                <th className="px-4 py-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map(company => {
                const staffCount = appData.employees.filter(e => e.companyId === company.id).length;
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
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 text-primary flex items-center justify-center font-display font-bold text-xs shrink-0 border border-primary/20">
                          {company.companyName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{company.companyName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">ID: {company.id.substring(0, 8)}</span>
                        </div>
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
                              onClick={() => setViewingPhoto({ url: company.crPhoto!, title: `${company.companyName} — CR Certificate` })}
                              className="text-primary hover:text-primary/80 transition-colors"
                              title="View Cloudinary Photo"
                            >
                              <Eye className="h-3.5 w-3.5 text-blue-500 hover:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>
                        <div>{renderExpiryBadge(company.crExpiry)}</div>
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
                              title="View Cloudinary Photo"
                            >
                              <Eye className="h-3.5 w-3.5 text-emerald-500 hover:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>
                        <div>{renderExpiryBadge(company.licenseExpiry)}</div>
                      </div>
                    </td>

                    {/* Authorized Officer */}
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <div className="flex flex-col text-[11px]">
                        <span className="font-semibold text-foreground">{company.ownerName || '—'}</span>
                        {company.phone && <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {company.phone}</span>}
                        {company.email && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {company.email}</span>}
                      </div>
                    </td>

                    {/* Staff Count */}
                    <td className="px-4 py-3.5 font-mono">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold text-[10px]">
                        <Users className="h-3 w-3" />
                        {staffCount} employees
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10" 
                          onClick={() => handleEdit(company)}
                          title="Edit Company Details"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                          onClick={() => setDeletingId(company.id)}
                          title="Delete Company"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-xs">
                    No companies matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloudinary Photo Full Preview Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-card rounded-2xl overflow-hidden shadow-2xl border p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-foreground">{viewingPhoto.title}</span>
                {viewingPhoto.url.includes('cloudinary') && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    <Cloud className="h-2.5 w-2.5" /> Cloudinary CDN
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setViewingPhoto(null)}
              >
                Close
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewingPhoto.url}
              alt={viewingPhoto.title}
              className="max-h-[65vh] w-auto mx-auto object-contain rounded-xl shadow-md"
            />
            <div className="pt-3 text-center">
              <a
                href={viewingPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-primary hover:underline font-mono"
              >
                Open Original Full Image ↗
              </a>
            </div>
          </div>
        </div>
      )}

      <CompanyFormModal open={isFormOpen} onOpenChange={setIsFormOpen} company={editingCompany} />
      <DeleteConfirmModal 
        open={!!deletingId} 
        onOpenChange={(open) => !open && setDeletingId(null)} 
        title="Delete Company(s)" 
        description="Are you sure you want to delete? This will also remove all associated employees and documents." 
        isLoading={deleteMutation.isPending} 
        onConfirm={handleDeleteConfirm} 
      />
    </div>
  );
}
