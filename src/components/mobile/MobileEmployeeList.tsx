'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Users, Phone, CreditCard, BookOpen, Building2, Briefcase, Globe } from 'lucide-react';
import { calculateEmployeeQidStatus, EMPLOYEE_STATUS_META } from '@/lib/status-calculator';
import MobileEmployeeDetail from './MobileEmployeeDetail';
import MobileEmployeeForm from './MobileEmployeeForm';
import { useDeleteEmployee } from '@/hooks/use-employees';
import { Employee } from '@/types';
import { getDaysRemaining, cn } from '@/lib/utils';
import {
  PageHeader,
  SearchFilterBar,
  EntityCard,
  ConfirmationDialog,
  StatusFilterOption,
} from '@/components/shared';

interface MobileEmployeeListProps {
  appData: AppData;
}

export default function MobileEmployeeList({ appData }: MobileEmployeeListProps) {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  const deleteEmployeeMutation = useDeleteEmployee();

  const { 
    employees, 
    companies, 
    employeeCounts,
    employeeStatusFilter,
    setEmployeeStatusFilter,
    selectedEmployee, 
    setSelectedEmployee, 
    isDetailsOpen, 
    setIsDetailsOpen 
  } = appData;

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (emp.employeeName || '').toLowerCase().includes(q) ||
        (emp.qidNumber || '').includes(q) ||
        (emp.passportNumber || '').toLowerCase().includes(q) ||
        (emp.phone || '').toLowerCase().includes(q) ||
        (emp.nativeRelativePhone || '').toLowerCase().includes(q);

      const matchesCompany = companyFilter ? emp.companyId === companyFilter : true;
      
      const qidStatus = calculateEmployeeQidStatus(emp.qidExpiry);
      const matchesStatus = (employeeStatusFilter && employeeStatusFilter !== 'ALL')
        ? qidStatus === employeeStatusFilter
        : true;

      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [employees, search, companyFilter, employeeStatusFilter]);

  const handleDeleteConfirm = async () => {
    if (deletingEmployee) {
      await deleteEmployeeMutation.mutateAsync(deletingEmployee.id);
      setDeletingEmployee(null);
    }
  };

  if (isDetailsOpen && selectedEmployee) {
    return (
      <MobileEmployeeDetail 
        employee={selectedEmployee} 
        onBack={() => setIsDetailsOpen(false)} 
      />
    );
  }

  const getPassportBadge = (dateString?: string | null) => {
    if (!dateString) return null;
    const days = getDaysRemaining(dateString);
    if (days < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap bg-rose-500/10 text-rose-600 border border-rose-500/20">
          Expired
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {days}d left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium whitespace-nowrap bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        Valid
      </span>
    );
  };

  const statusChips: StatusFilterOption[] = [
    { id: 'ALL', label: 'All', count: employees.length, variant: 'neutral' },
    { id: 'SAFE', label: '🟢 Safe', count: employeeCounts.safe, variant: 'safe' },
    { id: 'MONTH_1_EXPIRED', label: '⚫ 1st Mo', count: employeeCounts.month1Expired, variant: 'expired' },
    { id: 'MONTH_2_EXPIRED', label: '🟡 2nd Mo', count: employeeCounts.month2Expired, variant: 'warning' },
    { id: 'MONTH_3_EXPIRED', label: '🔴 3rd Mo', count: employeeCounts.month3Expired, variant: 'danger' },
    { id: 'FULLY_EXPIRED', label: '⚪ Outside', count: employeeCounts.fullyExpired, variant: 'expired' },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 space-y-3 border-b shadow-xs shrink-0">
        <PageHeader
          title="Employee Directory"
          icon={Users}
          badgeCount={filteredEmployees.length}
          badgeLabel="Shown"
          className="p-3 border-none shadow-none bg-transparent"
        />

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, QID, phone, passport..."
          statusFilters={statusChips}
          activeStatusFilter={employeeStatusFilter || 'ALL'}
          onStatusFilterChange={setEmployeeStatusFilter}
        >
          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="flex-shrink-0 h-11 px-3.5 rounded-xl bg-card text-xs font-semibold border border-border/80 focus:ring-1 focus:ring-primary appearance-none outline-none max-w-[140px] truncate shadow-xs"
          >
            <option value="">All Sponsors</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </SearchFilterBar>
      </header>

      {/* Employee Cards Feed */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))]">
        {filteredEmployees.map(emp => {
          const initials = (emp.employeeName || 'EM').substring(0, 2).toUpperCase();
          const qidStatus = calculateEmployeeQidStatus(emp.qidExpiry);
          const qidMeta = EMPLOYEE_STATUS_META[qidStatus];
          const qidDays = getDaysRemaining(emp.qidExpiry);
          const isOwner = emp.role?.toUpperCase() === 'OWNER';

          return (
            <EntityCard
              key={emp.id}
              title={emp.employeeName}
              initials={initials}
              tagBadge={
                <span className={cn(
                  "px-1.5 py-0.2 rounded-md text-[9px] font-bold font-mono uppercase tracking-wider border",
                  isOwner ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-muted text-muted-foreground border-border"
                )}>
                  {isOwner ? 'Owner' : 'Employee'}
                </span>
              }
              subtitle={
                <div className="space-y-0.5 mt-0.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground break-words">
                    <Building2 className="w-3 h-3 text-primary shrink-0" />
                    <span className="truncate">{emp.company?.companyName || 'Unassigned Sponsor'}</span>
                  </div>
                  {emp.currentWorkingCompany && emp.currentWorkingCompanyId !== emp.companyId && (
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium break-words">
                      <Briefcase className="w-3 h-3 shrink-0" />
                      <span className="truncate">Works at: {emp.currentWorkingCompany.companyName}</span>
                    </div>
                  )}
                </div>
              }
              details={
                <div className="space-y-2">
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-xs font-mono text-foreground bg-muted/20 px-3 py-1.5 rounded-xl break-all">
                      <Phone className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-muted/30 space-y-2 text-xs font-mono">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                        <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">QID: <strong className="text-foreground font-semibold break-all">{emp.qidNumber}</strong></span>
                      </span>
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap border shrink-0",
                        qidMeta.badgeBg,
                        qidMeta.badgeText,
                        qidMeta.badgeBorder
                      )}>
                        {qidMeta.shortLabel} {qidStatus !== 'SAFE' && `(${Math.abs(qidDays)}d)`}
                      </span>
                    </div>

                    {emp.passportNumber && (
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
                        <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                          <BookOpen className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">Pass: <strong className="text-foreground font-semibold break-all">{emp.passportNumber}</strong></span>
                        </span>
                        <div className="shrink-0">{getPassportBadge(emp.passportExpiry)}</div>
                      </div>
                    )}
                  </div>
                </div>
              }
              onTap={() => {
                setSelectedEmployee(emp);
                setIsDetailsOpen(true);
              }}
              onEdit={() => setEditingEmployee(emp)}
              onDelete={() => setDeletingEmployee(emp)}
            />
          );
        })}
      </main>

      {editingEmployee && (
        <MobileEmployeeForm employee={editingEmployee} onBack={() => setEditingEmployee(null)} />
      )}

      <ConfirmationDialog
        open={!!deletingEmployee}
        onOpenChange={(open) => !open && setDeletingEmployee(null)}
        title="Delete Employee"
        description={`Are you sure you want to delete ${deletingEmployee?.employeeName}? This action cannot be undone.`}
        isLoading={deleteEmployeeMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
