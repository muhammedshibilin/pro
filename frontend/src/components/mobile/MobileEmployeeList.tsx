'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MobileEmployeeCard from './MobileEmployeeCard';
import MobileEmployeeDetail from './MobileEmployeeDetail';

interface MobileEmployeeListProps {
  appData: AppData;
}

export default function MobileEmployeeList({ appData }: MobileEmployeeListProps) {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { employees, companies, selectedEmployee, setSelectedEmployee, isDetailsOpen, setIsDetailsOpen } = appData;

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
      const matchesStatus = statusFilter ? emp.status === statusFilter : true;
      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [employees, search, companyFilter, statusFilter]);

  if (isDetailsOpen && selectedEmployee) {
    return (
      <MobileEmployeeDetail 
        employee={selectedEmployee} 
        onBack={() => setIsDetailsOpen(false)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md p-4 space-y-3 pb-2.5 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Personnel Directory
          </h1>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {employees.length} Monitored
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search personnel, QID, phone, passport..." 
            className="w-full h-10 pl-9 rounded-xl bg-muted/70 border-none text-xs"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="flex-shrink-0 h-8 px-3 rounded-full bg-muted text-xs font-semibold border-none focus:ring-1 focus:ring-primary appearance-none outline-none"
          >
            <option value="">All Sponsors</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>

          {['', 'Active', 'On Leave', 'Terminated'].map((st) => (
            <button
              key={st || 'all'}
              onClick={() => setStatusFilter(st)}
              className={`flex-shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {st || 'All Status'}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-28">
        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
            <div className="w-14 h-14 bg-muted/80 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No personnel found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms</p>
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
      </div>
    </div>
  );
}
