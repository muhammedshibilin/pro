'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { calculateEmployeeQidStatus } from '@/lib/status-calculator';
import MobileEmployeeCard from './MobileEmployeeCard';
import MobileEmployeeDetail from './MobileEmployeeDetail';
import { cn } from '@/lib/utils';

interface MobileEmployeeListProps {
  appData: AppData;
}

export default function MobileEmployeeList({ appData }: MobileEmployeeListProps) {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  
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

  if (isDetailsOpen && selectedEmployee) {
    return (
      <MobileEmployeeDetail 
        employee={selectedEmployee} 
        onBack={() => setIsDetailsOpen(false)} 
      />
    );
  }

  const statusChips = [
    { id: 'ALL', label: 'All', count: employees.length, color: 'bg-muted text-muted-foreground' },
    { id: 'SAFE', label: '🟢 Safe', count: employeeCounts.safe, color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
    { id: 'MONTH_1_EXPIRED', label: '⚫ 1st Mo', count: employeeCounts.month1Expired, color: 'bg-zinc-900 text-zinc-100 border-zinc-700' },
    { id: 'MONTH_2_EXPIRED', label: '🟡 2nd Mo', count: employeeCounts.month2Expired, color: 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold' },
    { id: 'MONTH_3_EXPIRED', label: '🔴 3rd Mo', count: employeeCounts.month3Expired, color: 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold' },
    { id: 'FULLY_EXPIRED', label: '⚪ Outside', count: employeeCounts.fullyExpired, color: 'bg-slate-500/15 text-slate-700 dark:text-slate-300' },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 space-y-3 border-b shadow-xs shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-foreground font-display flex items-center gap-2 truncate">
            <Users className="w-5 h-5 text-primary shrink-0" />
            <span>Employee Directory</span>
          </h1>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
            {filteredEmployees.length} Shown
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, QID, phone, passport..." 
            className="w-full h-11 pl-10 rounded-xl bg-muted/60 border-none text-sm"
          />
        </div>
        
        {/* Filter Chips Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="flex-shrink-0 h-8 px-3 rounded-full bg-muted text-xs font-semibold border-none focus:ring-1 focus:ring-primary appearance-none outline-none max-w-[130px] truncate"
          >
            <option value="">All Sponsors</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>

          {statusChips.map((chip) => {
            const isSelected = (employeeStatusFilter || 'ALL') === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setEmployeeStatusFilter(chip.id)}
                className={cn(
                  "flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5",
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

      {/* Employee Cards Feed */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))]">
        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
            <div className="w-14 h-14 bg-muted/80 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No employees found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or QID status filter</p>
            </div>
          </div>
        ) : (
          filteredEmployees.map(emp => (
            <MobileEmployeeCard 
              key={emp.id} 
              employee={emp} 
              onTap={(e) => {
                setSelectedEmployee(e);
                setIsDetailsOpen(true);
              }} 
            />
          ))
        )}
      </main>
    </div>
  );
}
