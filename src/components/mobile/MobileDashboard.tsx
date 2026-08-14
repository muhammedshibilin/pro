'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Search, Building2, UserPlus, Filter } from 'lucide-react';
import { CompanyStatusBoxes, EmployeeStatusBoxes } from '@/components/status-boxes';
import { CompanyAttentionList, EmployeeAttentionList } from '@/components/attention-lists';
import { DashboardSectionSelector, DashboardSectionTab } from '@/components/dashboard-section-selector';
import MobileCompanyDetail from './MobileCompanyDetail';
import MobileEmployeeDetail from './MobileEmployeeDetail';
import { Company, Employee, CompanyStatusCounts, EmployeeStatusCounts } from '@/types';
import { calculateCompanyDocumentStatus, calculateEmployeeQidStatus, CompanyDocumentStatus } from '@/lib/status-calculator';

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

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b flex items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block truncate">
            {todayStr}
          </span>
          <h1 className="text-lg font-extrabold text-foreground font-display tracking-tight truncate">
            Expiry Monitoring
          </h1>
        </div>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-10 h-10 rounded-2xl bg-muted/80 flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all shrink-0 border"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </header>

      {/* Main Dashboard Scroll View */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))]">
        
        {/* ========================================================================= */}
        {/* SECTION & COMPANY SELECTOR BAR */}
        {/* ========================================================================= */}
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

        {/* Active Filter Scope Notification */}
        {selectedCompanyObj && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <div className="flex items-center gap-1.5 min-w-0">
              <Filter className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Scope: <strong>{selectedCompanyObj.companyName}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCompanyId('ALL')}
              className="text-xs text-primary underline font-bold shrink-0 ml-2"
            >
              Reset
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. COMPANY DOCUMENTS SECTION (3 FULL-COLOR BOXES + ATTENTION LIST) */}
        {/* ========================================================================= */}
        {(activeSection === 'ALL' || activeSection === 'COMPANIES') && (
          <section className="space-y-4">
            <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-xs space-y-4">
              <CompanyStatusBoxes
                counts={scopedCompanyCounts}
                activeFilter={appData.companyStatusFilter}
                onSelectStatus={handleSelectCompanyStatus}
              />

              <div className="pt-3 border-t border-border/60">
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
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 2. EMPLOYEE QID EXPIRY SECTION (4 FULL-COLOR BOXES + ATTENTION LIST) */}
        {/* ========================================================================= */}
        {(activeSection === 'ALL' || activeSection === 'EMPLOYEES') && (
          <section className="space-y-4">
            <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-xs space-y-4">
              <EmployeeStatusBoxes
                counts={scopedEmployeeCounts}
                activeFilter={appData.employeeStatusFilter}
                onSelectStatus={handleSelectEmployeeStatus}
              />

              <div className="pt-3 border-t border-border/60">
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
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. SECONDARY DASHBOARD INFORMATION */}
        {/* ========================================================================= */}
        <section className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            System Overview
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                setCompanyStatusFilter('ALL');
                setActiveView('companies');
              }}
              className="p-3.5 rounded-2xl bg-card border text-left flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Companies</span>
                <span className="text-xl font-bold font-mono text-foreground">{companies.length}</span>
              </div>
              <Building2 className="w-4 h-4 text-primary shrink-0" />
            </button>

            <button
              onClick={() => {
                setEmployeeStatusFilter('ALL');
                setActiveView('employees');
              }}
              className="p-3.5 rounded-2xl bg-card border text-left flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Employees</span>
                <span className="text-xl font-bold font-mono text-foreground">{employees.length}</span>
              </div>
              <UserPlus className="w-4 h-4 text-primary shrink-0" />
            </button>
          </div>
        </section>
      </main>

      {/* Full Sheet Detail Views */}
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
