'use client';

import React, { useState } from 'react';
import { useAppData, AppView } from '@/hooks/use-app-data';
import MobileLayout from './MobileLayout';
import MobileDashboard from './MobileDashboard';
import MobileEmployeeList from './MobileEmployeeList';
import MobileCompanyList from './MobileCompanyList';
import MobileAlertList from './MobileAlertList';
import MobileSettings from './MobileSettings';
import MobileSearch from './MobileSearch';
import MobileEmployeeForm from './MobileEmployeeForm';
import MobileCompanyForm from './MobileCompanyForm';
import { DocumentFormModal } from '@/components/document-form-modal';
import { EmployeeDetailsModal } from '@/components/employee-details-modal';

export default function MobileApp() {
  const appData = useAppData();
  
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);

  const handleTabChange = (view: AppView) => {
    // When changing tabs, close all open forms and detail overlays cleanly
    setIsEmployeeFormOpen(false);
    setIsCompanyFormOpen(false);
    appData.setIsDetailsOpen(false);
    appData.setSelectedEmployee(undefined);
    appData.setIsDocFormOpen(false);
    appData.setActiveView(view);
  };

  const isFormOrOverlayActive = isEmployeeFormOpen || isCompanyFormOpen || appData.isDetailsOpen || appData.isDocFormOpen;
  
  const renderView = () => {
    switch (appData.activeView) {
      case 'dashboard': return <MobileDashboard appData={appData} />;
      case 'employees': return <MobileEmployeeList appData={appData} onAddEmployee={() => setIsEmployeeFormOpen(true)} />;
      case 'companies': return <MobileCompanyList appData={appData} onAddCompany={() => setIsCompanyFormOpen(true)} />;
      case 'alerts': return <MobileAlertList appData={appData} />;
      case 'settings': return <MobileSettings appData={appData} />;
      default: return <MobileDashboard appData={appData} />;
    }
  };

  return (
    <MobileLayout
      activeView={appData.activeView}
      onViewChange={handleTabChange}
      alertCount={appData.unreadAlertsCount}
      onAddEmployee={() => setIsEmployeeFormOpen(true)}
      onAddCompany={() => setIsCompanyFormOpen(true)}
      onAddDocument={appData.handleAddDocClick}
      isHideNav={isFormOrOverlayActive}
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
          handleTabChange('companies');
        }}
      />

      {isEmployeeFormOpen && (
        <MobileEmployeeForm onBack={() => setIsEmployeeFormOpen(false)} />
      )}
      
      {isCompanyFormOpen && (
        <MobileCompanyForm onBack={() => setIsCompanyFormOpen(false)} />
      )}
      
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

