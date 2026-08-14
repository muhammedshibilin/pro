'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { CompanyStatusBoxes, EmployeeStatusBoxes } from '@/components/status-boxes';
import { CompanyAttentionList, EmployeeAttentionList } from '@/components/attention-lists';
import { DashboardSectionSelector, DashboardSectionTab } from '@/components/dashboard-section-selector';
import { Button } from '@/components/ui/button';
import { Building2, Users, FilePlus, UserPlus, Search, ArrowRight, Filter } from 'lucide-react';
import { CompanyFormModal } from '@/components/company-form-modal';
import { EmployeeFormModal } from '@/components/employee-form-modal';
import { Company, CompanyStatusCounts, EmployeeStatusCounts } from '@/types';
import { calculateCompanyDocumentStatus, calculateEmployeeQidStatus, CompanyDocumentStatus } from '@/lib/status-calculator';

interface DesktopDashboardProps {
  appData: AppData;
}

export function DesktopDashboard({ appData }: DesktopDashboardProps) {
  const { 
    companies,
    employees,
    documents,
    setEmployeeStatusFilter, 
    setCompanyStatusFilter,
    setActiveView,
    handleOpenEmployeeDetails,
    setIsSearchOpen,
  } = appData;

  const [activeSection, setActiveSection] = useState<DashboardSectionTab>('ALL');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedCompanyForEdit, setSelectedCompanyForEdit] = useState<Company | undefined>(undefined);

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

  const handleOpenCompany = (company: Company) => {
    setSelectedCompanyForEdit(company);
    setIsCompanyModalOpen(true);
  };

  const selectedCompanyObj = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in pb-16">
      {/* Top Header Bar with Quick Add Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground">
            Expiry Monitoring Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Instant compliance overview for Company Licenses and Employee QIDs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="h-10 px-3.5 rounded-xl text-xs font-semibold gap-2 border-border/80"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span>Search (Ctrl+K)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCompanyForEdit(undefined);
              setIsCompanyModalOpen(true);
            }}
            className="h-10 px-3.5 rounded-xl text-xs font-semibold gap-1.5"
          >
            <Building2 className="w-4 h-4 text-primary" />
            <span>+ Add Company</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsEmployeeModalOpen(true)}
            className="h-10 px-4 rounded-xl text-xs font-semibold gap-1.5 shadow-md shadow-primary/20 bg-primary text-primary-foreground"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </Button>
        </div>
      </div>

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
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-in fade-in">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 shrink-0" />
            <span>
              Filtering dashboard to: <strong>{selectedCompanyObj.companyName}</strong> ({scopedEmployees.length} staff members, {scopedDocuments.length + 3} permits monitored)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCompanyId('ALL')}
            className="text-xs text-primary underline font-bold hover:opacity-80"
          >
            Show All Companies
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COMPANY DOCUMENTS SECTION (3 FULL-COLOR BOXES + ATTENTION LIST) */}
      {/* ========================================================================= */}
      {(activeSection === 'ALL' || activeSection === 'COMPANIES') && (
        <section className="space-y-6">
          <div className="p-6 md:p-8 bg-card rounded-3xl border border-border/80 shadow-xs space-y-6">
            {/* 3 Large Full-Color Boxes */}
            <CompanyStatusBoxes
              counts={scopedCompanyCounts}
              activeFilter={appData.companyStatusFilter}
              onSelectStatus={handleSelectCompanyStatus}
            />

            {/* List of Urgent Company Documents */}
            <div className="pt-4 border-t border-border/60">
              <CompanyAttentionList
                companies={scopedCompanies}
                documents={scopedDocuments}
                onOpenCompany={handleOpenCompany}
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
        <section className="space-y-6">
          <div className="p-6 md:p-8 bg-card rounded-3xl border border-border/80 shadow-xs space-y-6">
            {/* 4 Large Full-Color Boxes */}
            <EmployeeStatusBoxes
              counts={scopedEmployeeCounts}
              activeFilter={appData.employeeStatusFilter}
              onSelectStatus={handleSelectEmployeeStatus}
            />

            {/* List of Urgent Employees */}
            <div className="pt-4 border-t border-border/60">
              <EmployeeAttentionList
                employees={scopedEmployees}
                companies={companies}
                onOpenEmployee={handleOpenEmployeeDetails}
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
      {/* 3. SECONDARY DASHBOARD INFORMATION (COMPACT AT BOTTOM) */}
      {/* ========================================================================= */}
      <section className="pt-2 border-t border-border/40">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Companies</p>
                <p className="text-xl font-bold text-foreground font-mono">{companies.length}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCompanyStatusFilter('ALL');
                setActiveView('companies');
              }}
              className="text-xs text-primary gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Employees</p>
                <p className="text-xl font-bold text-foreground font-mono">{employees.length}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEmployeeStatusFilter('ALL');
                setActiveView('employees');
              }}
              className="text-xs text-primary gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Documents</p>
                <p className="text-xl font-bold text-foreground font-mono">{documents.length}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={appData.handleAddDocClick}
              className="text-xs text-primary gap-1"
            >
              <span>+ Add</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <CompanyFormModal
        company={selectedCompanyForEdit}
        open={isCompanyModalOpen}
        onOpenChange={setIsCompanyModalOpen}
      />

      <EmployeeFormModal
        open={isEmployeeModalOpen}
        onOpenChange={setIsEmployeeModalOpen}
      />
    </div>
  );
}
