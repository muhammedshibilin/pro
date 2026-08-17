'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Search, Filter, ShieldCheck, AlertTriangle, ShieldAlert, AlertCircle, Flame } from 'lucide-react';
import { CompanyAttentionList, EmployeeAttentionList } from '@/components/attention-lists';
import { DashboardSectionSelector, DashboardSectionTab } from '@/components/dashboard-section-selector';
import MobileCompanyDetail from './MobileCompanyDetail';
import MobileEmployeeDetail from './MobileEmployeeDetail';
import { Company, Employee, CompanyStatusCounts, EmployeeStatusCounts } from '@/types';
import { calculateCompanyDocumentStatus, calculateEmployeeQidStatus, CompanyDocumentStatus } from '@/lib/status-calculator';
import { cn } from '@/lib/utils';

interface MobileDashboardProps {
  appData: AppData;
}

export default function MobileDashboard({ appData }: MobileDashboardProps) {
  const { 
    companies,
    employees,
    documents,
    setActiveView, 
    setEmployeeStatusFilter,
    setCompanyStatusFilter,
    setIsSearchOpen,
    handleOpenEmployeeDetails,
  } = appData;

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const [activeSection, setActiveSection] = useState<DashboardSectionTab>('ALL');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');

  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Filter companies, employees, and documents based on company selection
  const scopedCompanies = useMemo(() => {
    if (selectedCompanyId === 'ALL') return companies;
    return companies.filter((c) => c.id === selectedCompanyId);
  }, [companies, selectedCompanyId]);

  const scopedEmployees = useMemo(() => {
    if (selectedCompanyId === 'ALL') return employees;
    return employees.filter((e) => e.companyId === selectedCompanyId || e.currentWorkingCompanyId === selectedCompanyId);
  }, [employees, selectedCompanyId]);

  const scopedDocuments = useMemo(() => {
    if (selectedCompanyId === 'ALL') return documents;
    return documents.filter((d) => d.companyId === selectedCompanyId);
  }, [documents, selectedCompanyId]);

  // Recalculate status counts dynamically for the scoped set
  const scopedCompanyCounts: CompanyStatusCounts = useMemo(() => {
    const counts: CompanyStatusCounts = { safe: 0, warning: 0, danger: 0 };
    scopedCompanies.forEach((c) => {
      const statuses: CompanyDocumentStatus[] = [];
      if (c.crExpiry) statuses.push(calculateCompanyDocumentStatus(c.crExpiry));
      if (c.licenseExpiry) statuses.push(calculateCompanyDocumentStatus(c.licenseExpiry));
      if (c.computerCardNumber && c.licenseExpiry) statuses.push(calculateCompanyDocumentStatus(c.licenseExpiry));

      if (statuses.includes('DANGER')) counts.danger++;
      else if (statuses.includes('WARNING')) counts.warning++;
      else if (statuses.length > 0) counts.safe++;
    });
    return counts;
  }, [scopedCompanies]);

  const scopedEmployeeCounts: EmployeeStatusCounts = useMemo(() => {
    const counts: EmployeeStatusCounts = { safe: 0, month1Expired: 0, month2Expired: 0, month3Expired: 0, fullyExpired: 0 };
    scopedEmployees.forEach((e) => {
      const status = calculateEmployeeQidStatus(e.qidExpiry);
      if (status === 'SAFE') counts.safe++;
      else if (status === 'MONTH_1_EXPIRED') counts.month1Expired++;
      else if (status === 'MONTH_2_EXPIRED') counts.month2Expired++;
      else if (status === 'MONTH_3_EXPIRED') counts.month3Expired++;
      else if (status === 'FULLY_EXPIRED') counts.fullyExpired++;
    });
    return counts;
  }, [scopedEmployees]);

  const handleSelectEmployeeStatus = (status: string) => {
    setEmployeeStatusFilter(status);
    setActiveView('employees');
  };

  const handleSelectCompanyStatus = (status: string) => {
    setCompanyStatusFilter(status);
    setActiveView('companies');
  };

  const handleOpenCompanyCard = (company: Company) => {
    setViewingCompany(company);
  };

  const handleOpenEmployeeCard = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      setViewingEmployee(emp);
    } else {
      handleOpenEmployeeDetails(employeeId);
    }
  };

  const selectedCompanyObj = companies.find((c) => c.id === selectedCompanyId);

  // Cards definitions for Company Documents (Safe - Green, Warning - Yellow, Danger - Red)
  const companyCards = [
    {
      id: 'SAFE',
      label: 'SAFE',
      sublabel: '3+ Months Left',
      desc: 'All permits valid',
      count: scopedCompanyCounts.safe,
      icon: ShieldCheck,
      bg: 'bg-emerald-600 dark:bg-emerald-700 text-white',
      pill: 'bg-emerald-700/60 text-emerald-100',
    },
    {
      id: 'WARNING',
      label: 'WARNING',
      sublabel: '2 Months Left',
      desc: 'Expiring in 2 months',
      count: scopedCompanyCounts.warning,
      icon: AlertTriangle,
      bg: 'bg-amber-400 dark:bg-amber-500 text-zinc-950 font-bold',
      pill: 'bg-amber-500/50 text-zinc-950 font-extrabold',
    },
    {
      id: 'DANGER',
      label: 'DANGER',
      sublabel: '< 1 Mo / Expired',
      desc: 'Action required now',
      count: scopedCompanyCounts.danger,
      icon: ShieldAlert,
      bg: 'bg-rose-600 dark:bg-rose-700 text-white',
      pill: 'bg-rose-700/60 text-rose-100 font-bold',
    },
  ];

  // Cards definitions for Employee QID (Safe - Green, 1st Mo - Black, 2nd Mo - Yellow, 3rd Mo - Red)
  const employeeCards = [
    {
      id: 'SAFE',
      label: 'SAFE',
      sublabel: 'Before Expiry',
      desc: 'QIDs valid',
      count: scopedEmployeeCounts.safe,
      icon: ShieldCheck,
      bg: 'bg-emerald-600 dark:bg-emerald-700 text-white',
      pill: 'bg-emerald-700/60 text-emerald-100',
    },
    {
      id: 'MONTH_1_EXPIRED',
      label: '1ST MONTH EXPIRED',
      sublabel: '0–1 Mo Past',
      desc: '1st month past expiry',
      count: scopedEmployeeCounts.month1Expired,
      icon: AlertCircle,
      bg: 'bg-zinc-950 dark:bg-black text-white border border-zinc-700',
      pill: 'bg-zinc-800 text-zinc-200 border border-zinc-600',
    },
    {
      id: 'MONTH_2_EXPIRED',
      label: '2ND MONTH EXPIRED',
      sublabel: '1–2 Mos Past',
      desc: '2nd month past expiry',
      count: scopedEmployeeCounts.month2Expired,
      icon: AlertTriangle,
      bg: 'bg-amber-400 dark:bg-amber-500 text-zinc-950 font-bold',
      pill: 'bg-amber-500/50 text-zinc-950 font-extrabold',
    },
    {
      id: 'MONTH_3_EXPIRED',
      label: '3RD MONTH EXPIRED',
      sublabel: '2–3 Mos Past',
      desc: '3rd month past expiry',
      count: scopedEmployeeCounts.month3Expired,
      icon: Flame,
      bg: 'bg-rose-600 dark:bg-rose-700 text-white',
      pill: 'bg-rose-700/60 text-rose-100 font-bold',
    },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Sticky Mobile Top Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b flex items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block truncate">
            {todayStr}
          </span>
          <h1 className="text-lg font-extrabold text-foreground font-display tracking-tight truncate">
            Expiry Monitoring Dashboard
          </h1>
        </div>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl bg-card border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all shrink-0 shadow-xs"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </header>

      {/* Main Expiry Monitoring Dashboard Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        
        {/* Module / Company Filter Selector Bar */}
        <DashboardSectionSelector
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          selectedCompanyId={selectedCompanyId}
          onSelectCompany={setSelectedCompanyId}
          companies={companies}
          totalCompanyCount={companies.length}
          totalEmployeeCount={employees.length}
          companyDangerCount={scopedCompanyCounts.danger}
          employeeExpiredCount={scopedEmployeeCounts.month1Expired + scopedEmployeeCounts.month2Expired + scopedEmployeeCounts.month3Expired}
        />

        {/* Scope Indicator */}
        {selectedCompanyObj && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <div className="flex items-center gap-1.5 min-w-0">
              <Filter className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Filter Scope: <strong>{selectedCompanyObj.companyName}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCompanyId('ALL')}
              className="text-xs text-primary underline font-bold shrink-0 ml-2"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. COMPANY DOCUMENTS EXPIRY SECTION (3 LARGE FULLY-FILLED COLOR CARDS) */}
        {/* ========================================================================= */}
        {(activeSection === 'ALL' || activeSection === 'COMPANIES') && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-foreground tracking-tight font-display">
                COMPANY DOCUMENTS EXPIRY
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                {scopedCompanies.length} Monitored
              </span>
            </div>

            {/* 3 Large Fully-Filled Color Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {companyCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCompanyStatus(card.id)}
                    className={cn(
                      "flex flex-col justify-between p-4 sm:p-5 rounded-2xl transition-all text-left shadow-xs cursor-pointer min-h-[130px] active:scale-[0.98]",
                      card.bg
                    )}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", card.pill)}>
                        {card.sublabel}
                      </span>
                      <Icon className="w-5 h-5 opacity-90 shrink-0" />
                    </div>

                    <div className="mt-3">
                      <p className="text-4xl font-black font-mono tracking-tight leading-none">
                        {card.count}
                      </p>
                      <div className="mt-2">
                        <h3 className="font-extrabold text-sm uppercase tracking-wide">
                          {card.label}
                        </h3>
                        <p className="text-[11px] opacity-90 leading-tight mt-0.5">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Attention List: Company Documents Requiring Attention */}
            <div className="pt-2">
              <CompanyAttentionList
                companies={scopedCompanies}
                documents={scopedDocuments}
                onOpenCompany={handleOpenCompanyCard}
                onViewAll={() => {
                  setCompanyStatusFilter('ALL');
                  setActiveView('companies');
                }}
              />
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 2. EMPLOYEE QID EXPIRY SECTION (2x2 GRID FULLY-FILLED COLOR CARDS) */}
        {/* ========================================================================= */}
        {(activeSection === 'ALL' || activeSection === 'EMPLOYEES') && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-foreground tracking-tight font-display">
                EMPLOYEE QID EXPIRY
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                {scopedEmployees.length} Staff Monitored
              </span>
            </div>

            {/* 2x2 Grid of Large Fully-Filled Color Cards on Mobile */}
            <div className="grid grid-cols-2 gap-3">
              {employeeCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectEmployeeStatus(card.id)}
                    className={cn(
                      "flex flex-col justify-between p-4 rounded-2xl transition-all text-left shadow-xs cursor-pointer min-h-[135px] active:scale-[0.98]",
                      card.bg
                    )}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className={cn("text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider truncate max-w-[110px]", card.pill)}>
                        {card.sublabel}
                      </span>
                      <Icon className="w-4 h-4 opacity-90 shrink-0" />
                    </div>

                    <div className="mt-3">
                      <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none">
                        {card.count}
                      </p>
                      <div className="mt-2">
                        <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide leading-tight break-words">
                          {card.label}
                        </h3>
                        <p className="text-[10px] opacity-90 leading-tight mt-0.5 break-words">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Attention List: Employees Requiring Attention */}
            <div className="pt-2">
              <EmployeeAttentionList
                employees={scopedEmployees}
                companies={companies}
                onOpenEmployee={handleOpenEmployeeCard}
                onViewAll={() => {
                  setEmployeeStatusFilter('ALL');
                  setActiveView('employees');
                }}
              />
            </div>
          </section>
        )}
      </main>

      {/* Full Sheet Detail Modal Overlays */}
      {viewingCompany && (
        <MobileCompanyDetail 
          company={viewingCompany} 
          onBack={() => setViewingCompany(null)} 
        />
      )}

      {viewingEmployee && (
        <MobileEmployeeDetail 
          employee={viewingEmployee} 
          onBack={() => setViewingEmployee(null)} 
        />
      )}
    </div>
  );
}
