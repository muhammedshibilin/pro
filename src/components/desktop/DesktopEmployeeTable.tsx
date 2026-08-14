'use client';

import React, { useState } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { useDeleteEmployee } from '@/hooks/use-employees';
import { DesktopFilterPanel } from './DesktopFilterPanel';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Eye, Edit3, Trash2, Phone, Globe, CreditCard, BookOpen, Building2, Briefcase } from 'lucide-react';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { 
  calculateEmployeeQidStatus, 
  EMPLOYEE_STATUS_META 
} from '@/lib/status-calculator';
import { EmployeeFormModal } from '@/components/employee-form-modal';
import { DeleteConfirmModal } from '@/components/delete-confirm-modal';
import { Employee } from '@/types';
import { cn } from '@/lib/utils';

interface DesktopEmployeeTableProps {
  appData: AppData;
}

export function DesktopEmployeeTable({ appData }: DesktopEmployeeTableProps) {
  const { 
    employees, 
    companies, 
    employeeCounts, 
    employeeStatusFilter, 
    setEmployeeStatusFilter 
  } = appData;
  const deleteMutation = useDeleteEmployee();
  
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  
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
      (e.passportNumber || '').toLowerCase().includes(q) ||
      (e.company?.companyName || '').toLowerCase().includes(q) ||
      (e.currentWorkingCompany?.companyName || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (companyFilter && e.companyId !== companyFilter && e.currentWorkingCompanyId !== companyFilter) return false;
    
    const qidStatus = calculateEmployeeQidStatus(e.qidExpiry);
    if (employeeStatusFilter && employeeStatusFilter !== 'ALL' && qidStatus !== employeeStatusFilter) {
      return false;
    }
    
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filtered.map(e => e.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderQidBadge = (dateString?: string | null) => {
    if (!dateString) return <span className="text-muted-foreground italic text-[10px]">No QID Date</span>;
    const status = calculateEmployeeQidStatus(dateString);
    const meta = EMPLOYEE_STATUS_META[status];
    const days = getDaysRemaining(dateString);

    let detailText = '';
    if (status === 'SAFE') {
      detailText = `Valid (${formatDate(dateString)})`;
    } else {
      detailText = `${meta.shortLabel} (${Math.abs(days)}d ago)`;
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

  const renderPassportBadge = (dateString?: string | null) => {
    if (!dateString) return <span className="text-muted-foreground italic text-[10px]">No Passport Date</span>;
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

  const filterChips: { id: string; label: string; count: number; colorClass: string }[] = [
    { id: 'ALL', label: 'All Staff', count: employees.length, colorClass: 'bg-muted text-foreground' },
    { id: 'SAFE', label: '🟢 Safe', count: employeeCounts.safe, colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
    { id: 'MONTH_1_EXPIRED', label: '⚫ 1st Mo Expired', count: employeeCounts.month1Expired, colorClass: 'bg-zinc-900 text-zinc-100 border-zinc-700' },
    { id: 'MONTH_2_EXPIRED', label: '🟡 2nd Mo Expired', count: employeeCounts.month2Expired, colorClass: 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold' },
    { id: 'MONTH_3_EXPIRED', label: '🔴 3rd Mo Expired', count: employeeCounts.month3Expired, colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold' },
    { id: 'FULLY_EXPIRED', label: '⚪ Fully Expired', count: employeeCounts.fullyExpired, colorClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300' },
  ];
  
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
            Employee registry with Role assignments, Registered & Working company dual-tracking, and 4-Tier QID calendar-month radar.
          </p>
        </div>

        <Button onClick={handleAdd} className="rounded-xl shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-4">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* 4-Tier Status Filter Quick Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterChips.map((chip) => {
          const isSelected = (employeeStatusFilter || 'ALL') === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setEmployeeStatusFilter(chip.id)}
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
          options={[{value: '', label: 'All Companies'}, ...companies.map(c => ({value: c.id, label: c.companyName}))]} 
          value={companyFilter} 
          onChange={(e) => setCompanyFilter(e.target.value)} 
        />
        <Select 
          options={[
            {value: 'ALL', label: 'All QID Statuses'}, 
            {value: 'SAFE', label: '🟢 Safe / Before Expiry'}, 
            {value: 'MONTH_1_EXPIRED', label: '⚫ 1st Month Expired (0–1 Mo)'}, 
            {value: 'MONTH_2_EXPIRED', label: '🟡 2nd Month Expired (1–2 Mos)'},
            {value: 'MONTH_3_EXPIRED', label: '🔴 3rd Month Expired (2–3 Mos)'},
            {value: 'FULLY_EXPIRED', label: '⚪ Fully Expired (>3 Mos)'}
          ]} 
          value={employeeStatusFilter || 'ALL'} 
          onChange={(e) => setEmployeeStatusFilter(e.target.value)} 
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
                <th className="px-4 py-3.5">Employee & Role</th>
                <th className="px-4 py-3.5">Company Assignments</th>
                <th className="px-4 py-3.5">Contact Numbers</th>
                <th className="px-4 py-3.5">Qatar ID (QID Status)</th>
                <th className="px-4 py-3.5">Passport Details</th>
                <th className="px-4 py-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map(emp => {
                const regCompany = companies.find(c => c.id === emp.companyId) || emp.company;
                const workCompany = emp.currentWorkingCompanyId ? (companies.find(c => c.id === emp.currentWorkingCompanyId) || emp.currentWorkingCompany) : null;
                const isOwner = emp.role?.toUpperCase() === 'OWNER';

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
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{emp.employeeName}</span>
                            <span className={cn(
                              "px-1.5 py-0.2 rounded-md text-[9px] font-bold font-mono uppercase tracking-wider border",
                              isOwner ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-muted text-muted-foreground border-border"
                            )}>
                              {isOwner ? 'Owner' : 'Employee'}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{emp.notes || 'Profile'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Company Assignments: Registered & Working */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate max-w-[170px]" title={`Registered Sponsor: ${regCompany?.companyName || 'Unassigned'}`}>
                            {regCompany?.companyName || <span className="italic text-muted-foreground/70">Unassigned</span>}
                          </span>
                        </div>
                        {workCompany && workCompany.id !== regCompany?.id && (
                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[11px] font-medium" title={`Current Working: ${workCompany.companyName}`}>
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[170px]">Works at: <strong>{workCompany.companyName}</strong></span>
                          </div>
                        )}
                      </div>
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
                        <div>{renderQidBadge(emp.qidExpiry)}</div>
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
                        <div>{renderPassportBadge(emp.passportExpiry)}</div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                          onClick={() => appData.handleOpenEmployeeDetails(emp.id)}
                          title="View Full Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
                          onClick={() => handleEdit(emp)}
                          title="Edit Employee"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                          onClick={() => setDeletingId(emp.id)}
                          title="Delete Employee"
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
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CreditCard className="h-8 w-8 text-muted-foreground/40" />
                      <p className="font-semibold text-sm">No employees match your active filter criteria</p>
                      <p className="text-xs">Try adjusting your search query or status filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <EmployeeFormModal 
        employee={editingEmp} 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />

      <DeleteConfirmModal 
        open={!!deletingId} 
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
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
