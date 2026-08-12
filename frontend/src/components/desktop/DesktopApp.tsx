'use client';

import React from 'react';
import { useAppData } from '@/hooks/use-app-data';
import { DesktopLayout } from './DesktopLayout';
import { DesktopDashboard } from './DesktopDashboard';
import { DesktopSettings } from './DesktopSettings';
import { DesktopAlertList } from './DesktopAlertList';
import { DesktopEmployeeTable } from './DesktopEmployeeTable';
import { DesktopCompanyTable } from './DesktopCompanyTable';
import { GlobalSearch } from '@/components/global-search';
import { DocumentFormModal } from '@/components/document-form-modal';
import { EmployeeDetailsModal } from '@/components/employee-details-modal';

export function DesktopApp() {
  const appData = useAppData();

  const renderActiveView = () => {
    switch (appData.activeView) {
      case 'dashboard':
        return <DesktopDashboard appData={appData} />;
      case 'companies':
        return <DesktopCompanyTable appData={appData} />;
      case 'employees':
        return <DesktopEmployeeTable appData={appData} />;
      case 'alerts':
        return <DesktopAlertList appData={appData} />;
      case 'settings':
        return <DesktopSettings appData={appData} />;
      default:
        return <DesktopDashboard appData={appData} />;
    }
  };

  return (
    <>
      <DesktopLayout
        activeView={appData.activeView}
        onViewChange={appData.setActiveView}
        notificationCount={appData.unreadAlertsCount}
        onSearchTrigger={() => appData.setIsSearchOpen(true)}
      >
        <div className="h-full animate-in fade-in duration-300">
          {renderActiveView()}
        </div>
      </DesktopLayout>

      <GlobalSearch 
        open={appData.isSearchOpen} 
        onOpenChange={appData.setIsSearchOpen} 
        onSelectEmployee={appData.handleOpenEmployeeDetails}
        onSelectCompany={appData.handleOpenCompanyRegistry}
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
    </>
  );
}
