'use client';

import React, { useState } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import MobileLayout from './MobileLayout';
import MobileDashboard from './MobileDashboard';
import MobileEmployeeList from './MobileEmployeeList';
import MobileCompanyList from './MobileCompanyList';
import MobileAlertList from './MobileAlertList';
import MobileSettings from './MobileSettings';
import MobileSearch from './MobileSearch';
import { EmployeeFormModal } from '@/components/employee-form-modal';
import { CompanyFormModal } from '@/components/company-form-modal';
import { DocumentFormModal } from '@/components/document-form-modal';
import { EmployeeDetailsModal } from '@/components/employee-details-modal';

export default function MobileApp() {
  const appData = useAppData();
  
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  // Using appData for document form state since it's shared
  
  const renderView = () => {
    switch (appData.activeView) {
      case 'dashboard': return <MobileDashboard appData={appData} />;
      case 'employees': return <MobileEmployeeList appData={appData} />;
      case 'companies': return <MobileCompanyList appData={appData} />;
      case 'alerts': return <MobileAlertList appData={appData} />;
      case 'settings': return <MobileSettings appData={appData} />;
      default: return <MobileDashboard appData={appData} />;
    }
  };

  return (
    <MobileLayout
      activeView={appData.activeView}
      onViewChange={appData.setActiveView}
      alertCount={appData.unreadAlertsCount}
      onAddEmployee={() => setIsEmployeeFormOpen(true)}
      onAddCompany={() => setIsCompanyFormOpen(true)}
      onAddDocument={appData.handleAddDocClick}
    >
      {renderView()}

      <MobileSearch 
        open={appData.isSearchOpen} 
        onOpenChange={appData.setIsSearchOpen}
        onSelectEmployee={(emp) => {
          appData.setSelectedEmployee(emp);
          appData.setIsDetailsOpen(true);
        }}
        onSelectCompany={() => {
          // In a real app we'd open the company detail, but for now just navigate
          appData.setActiveView('companies');
        }}
      />

      <EmployeeFormModal 
        open={isEmployeeFormOpen} 
        onOpenChange={setIsEmployeeFormOpen} 
      />
      
      <CompanyFormModal 
        open={isCompanyFormOpen} 
        onOpenChange={setIsCompanyFormOpen} 
      />
      
      <DocumentFormModal 
        document={appData.editingDoc || undefined} 
        open={appData.isDocFormOpen} 
        onOpenChange={appData.setIsDocFormOpen} 
      />
      
      <EmployeeDetailsModal
        employee={appData.selectedEmployee || undefined}
        open={appData.isDetailsOpen}
        onOpenChange={appData.setIsDetailsOpen}
      />
    </MobileLayout>
  );
}
