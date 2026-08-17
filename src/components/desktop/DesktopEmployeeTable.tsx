'use client';

import React, { useState } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { useDeleteEmployee } from '@/hooks/use-employees';
import { Select } from '@/components/ui/select';
import { Plus, Eye, Phone, Globe, CreditCard, BookOpen, Building2, Briefcase, Users } from 'lucide-react';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { 
  calculateEmployeeQidStatus, 
  EMPLOYEE_STATUS_META 
} from '@/lib/status-calculator';
import { EmployeeFormModal } from '@/components/employee-form-modal';
import { Employee } from '@/types';
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

  const filterChips: StatusFilterOption[] = [
    { id: 'ALL', label: 'All Staff', count: employees.length, variant: 'neutral' },
    { id: 'SAFE', label: '🟢 Safe', count: employeeCounts.safe, variant: 'safe' },
    { id: 'MONTH_1_EXPIRED', label: '⚫ 1st Mo Expired', count: employeeCounts.month1Expired, variant: 'expired' },
    { id: 'MONTH_2_EXPIRED', label: '🟡 2nd Mo Expired', count: employeeCounts.month2Expired, variant: 'warning' },
    { id: 'MONTH_3_EXPIRED', label: '🔴 3rd Mo Expired', count: employeeCounts.month3Expired, variant: 'danger' },
    { id: 'FULLY_EXPIRED', label: '⚪ Fully Expired', count: employeeCounts.fullyExpired, variant: 'expired' },
  ];

  const columns: Column<Employee>[] = [
    {
      key: 'employeeName',
      header: 'Employee & Role',
      render: (emp) => {
        const isOwner = emp.role?.toUpperCase() === 'OWNER';
        return (
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
        );
      },
    },
    {
      key: 'company',
      header: 'Company Assignments',
      render: (emp) => {
        const regCompany = companies.find(c => c.id === emp.companyId) || emp.company;
        const workCompany = emp.currentWorkingCompanyId ? (companies.find(c => c.id === emp.currentWorkingCompanyId) || emp.currentWorkingCompany) : null;
        return (
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
        );
      },
    },
    {
      key: 'contact',
      header: 'Contact Numbers',
      render: (emp) => (
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
      ),
    },
    {
      key: 'qid',
      header: 'Qatar ID (QID Status)',
      render: (emp) => (
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
      ),
    },
    {
      key: 'passport',
      header: 'Passport Details',
      render: (emp) => (
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
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right pr-6',
      render: (emp) => (
        <ActionMenu
          onView={() => appData.handleOpenEmployeeDetails(emp.id)}
          onEdit={() => handleEdit(emp)}
          onDelete={() => setDeletingId(emp.id)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full animate-fade-in space-y-6">
      {/* Top Page Header with Top-Right Primary Action */}
      <PageHeader
        title="Employee Directory"
        description="Employee registry with Role assignments, Registered & Working company dual-tracking, and 4-Tier QID calendar-month radar."
        icon={Users}
        badgeCount={employees.length}
        badgeLabel="Staff Monitored"
        primaryAction={{
          label: 'Add Employee',
          icon: Plus,
          onClick: handleAdd,
        }}
      />

      {/* Search & Status Filter Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employee name, QID, passport, phone..."
        statusFilters={filterChips}
        activeStatusFilter={employeeStatusFilter || 'ALL'}
        onStatusFilterChange={setEmployeeStatusFilter}
      >
        <Select 
          options={[{value: '', label: 'All Companies'}, ...companies.map(c => ({value: c.id, label: c.companyName}))]} 
          value={companyFilter} 
          onChange={(e) => setCompanyFilter(e.target.value)} 
          className="h-11 rounded-xl border-border/80 text-xs bg-card"
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
        emptyTitle="No employees match your active filter criteria"
        emptyDescription="Try adjusting your search query or status filter."
      />

      {/* Modals */}
      <EmployeeFormModal 
        employee={editingEmp} 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />

      <ConfirmationDialog 
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
