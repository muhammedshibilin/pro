'use client';

import React, { useState } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { useDeleteEmployee } from '@/hooks/use-employees';
import { DesktopFilterPanel } from './DesktopFilterPanel';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Eye, Edit3, Trash2, Phone, Globe, CreditCard, BookOpen, Cloud } from 'lucide-react';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { EmployeeFormModal } from '@/components/employee-form-modal';
import { DeleteConfirmModal } from '@/components/delete-confirm-modal';
import { Employee } from '@/types';

interface DesktopEmployeeTableProps {
  appData: AppData;
}

export function DesktopEmployeeTable({ appData }: DesktopEmployeeTableProps) {
  const { employees, companies } = appData;
  const deleteMutation = useDeleteEmployee();
  
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingEmp, setEditingEmp] = useState<Employee | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);
  
  const handleAdd = () => {
    setEditingEmp(undefined);
    setIsFormOpen(true);
  };
  
  const handleEdit = (emp: Employee) => {
    setEditingEmp(emp);
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

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (e.employeeName || '').toLowerCase().includes(q) ||
      (e.phone || '').toLowerCase().includes(q) ||
      (e.nativeRelativePhone || '').toLowerCase().includes(q) ||
      (e.qidNumber || '').toLowerCase().includes(q) ||
      (e.passportNumber || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (companyFilter && e.companyId !== companyFilter) return false;
    
    const qidDays = getDaysRemaining(e.qidExpiry);
    const passDays = e.passportExpiry ? getDaysRemaining(e.passportExpiry) : 999;
    const minDays = Math.min(qidDays, passDays);

    if (statusFilter === 'expired' && minDays >= 0) return false;
    if (statusFilter === 'expiring' && (minDays < 0 || minDays > 30)) return false;
    if (statusFilter === 'active' && minDays <= 30) return false;
    
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filtered.map(e => e.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderExpiryBadge = (dateString?: string | null, label?: string) => {
    if (!dateString) return <span className="text-muted-foreground italic text-[10px]">No {label || 'Date'}</span>;
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
          {days === 0 ? 'Due Today' : `${days}d left`}
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
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-foreground">Employee Directory</h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {employees.length} Staff Monitored
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Personnel registry tracking direct contacts, native relative numbers, Qatar ID expiries, and Passport statuses.
          </p>
        </div>

        <Button onClick={handleAdd} className="rounded-xl shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-4">
          <Plus className="h-4 w-4 mr-2" />
          Add Personnel
        </Button>
      </div>

      <DesktopFilterPanel searchValue={search} onSearchChange={setSearch}>
        <Select 
          options={[{value: '', label: 'All Companies'}, ...companies.map(c => ({value: c.id, label: c.companyName}))]} 
          value={companyFilter} 
          onChange={(e) => setCompanyFilter(e.target.value)} 
        />
        <Select 
          options={[{value: '', label: 'All Statuses'}, {value: 'active', label: 'Compliant'}, {value: 'expiring', label: 'Expiring Soon'}, {value: 'expired', label: 'Expired'}]} 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
        />
      </DesktopFilterPanel>

      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3.5 flex items-center justify-between animate-fade-in">
          <span className="text-xs font-semibold text-primary font-mono">{selectedIds.length} employees selected</span>
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
                <th className="px-4 py-3.5">Personnel Name</th>
                <th className="px-4 py-3.5">Sponsoring Entity</th>
                <th className="px-4 py-3.5">Contact Numbers</th>
                <th className="px-4 py-3.5">Qatar ID (QID)</th>
                <th className="px-4 py-3.5">Passport Details</th>
                <th className="px-4 py-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map(emp => {
                const company = companies.find(c => c.id === emp.companyId);

                return (
                  <tr key={emp.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-4 py-3.5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(emp.id)} 
                        onChange={() => toggleSelect(emp.id)} 
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" 
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary flex items-center justify-center font-display font-bold text-xs shrink-0 ring-1 ring-primary/20">
                          {emp.employeeName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{emp.employeeName}</span>
                          <span className="text-[10px] text-muted-foreground">{emp.notes || 'Personnel'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground font-medium">
                      {company?.companyName || <span className="italic text-muted-foreground/70">Unassigned</span>}
                    </td>

                    {/* Contact Numbers: Local & Native Relative */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1 text-[11px]">
                        <div className="flex items-center gap-1.5 font-mono text-foreground font-semibold">
                          <Phone className="h-3 w-3 text-amber-600 shrink-0" />
                          <span>{emp.phone || 'No Contact Number'}</span>
                        </div>
                        {emp.nativeRelativePhone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]" title="Native relative contact">
                            <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[180px]">{emp.nativeRelativePhone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Qatar ID (QID) */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
                          <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>{emp.qidNumber || '—'}</span>
                          {emp.qidPhoto && (
                            <button
                              type="button"
                              onClick={() => setViewingPhoto({ url: emp.qidPhoto!, title: `${emp.employeeName} — Qatar ID Photo` })}
                              className="text-primary hover:text-primary/80 transition-colors"
                              title="View Qatar ID Photo"
                            >
                              <Eye className="h-3.5 w-3.5 text-blue-500 hover:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>
                        <div>{renderExpiryBadge(emp.qidExpiry, 'QID')}</div>
                      </div>
                    </td>

                    {/* Passport Details */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
                          <BookOpen className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{emp.passportNumber || '—'}</span>
                          {emp.passportPhoto && (
                            <button
                              type="button"
                              onClick={() => setViewingPhoto({ url: emp.passportPhoto!, title: `${emp.employeeName} — Passport Document` })}
                              className="text-primary hover:text-primary/80 transition-colors"
                              title="View Passport Photo"
                            >
                              <Eye className="h-3.5 w-3.5 text-emerald-500 hover:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>
                        <div>{renderExpiryBadge(emp.passportExpiry, 'Passport')}</div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10" 
                          onClick={() => appData.handleOpenEmployeeDetails(emp.id)}
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10" 
                          onClick={() => handleEdit(emp)}
                          title="Edit Employee"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                          onClick={() => setDeletingId(emp.id)}
                          title="Delete Employee"
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
                    No employee records match the active filter criteria.
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

      <EmployeeFormModal open={isFormOpen} onOpenChange={setIsFormOpen} employee={editingEmp} />
      <DeleteConfirmModal 
        open={!!deletingId} 
        onOpenChange={(open) => !open && setDeletingId(null)} 
        title="Delete Employee(s)" 
        description="Are you sure you want to delete the selected employee(s)? This action cannot be undone." 
        isLoading={deleteMutation.isPending} 
        onConfirm={handleDeleteConfirm} 
      />
    </div>
  );
}
