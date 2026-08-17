'use client';

import React from 'react';
import { AppData, AlertCategory } from '@/hooks/use-app-data';
import { Bell, CheckCheck } from 'lucide-react';
import MobileAlertCard from './MobileAlertCard';
import { PageHeader, SearchFilterBar, StatusFilterOption } from '@/components/shared';

interface MobileAlertListProps {
  appData: AppData;
}

export default function MobileAlertList({ appData }: MobileAlertListProps) {
  const { 
    filteredAlerts, 
    alertSearch, 
    setAlertSearch, 
    alertCategoryFilter, 
    setAlertCategoryFilter, 
    handleMarkRead, 
    handleDeleteAlert,
    handleOpenEmployeeDetails,
    handleOpenCompanyRegistry,
    handleMarkAllRead
  } = appData;

  const categories: StatusFilterOption[] = [
    { id: '', label: 'All Alerts' },
    { id: '1st Month Expired', label: '⚫ 1st Mo Expired', variant: 'neutral' },
    { id: '2nd Month Expired', label: '🟡 2nd Mo Expired', variant: 'warning' },
    { id: '3rd Month Expired', label: '🔴 3rd Mo Expired', variant: 'danger' },
    { id: 'Danger', label: '🔴 Danger (<1 Mo / Exp)', variant: 'danger' },
    { id: 'Warning', label: '🟡 Warning (2 Mo)', variant: 'warning' },
    { id: 'Fully Expired', label: '⚪ Outside (3+ Mo)', variant: 'neutral' },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Sticky Header & Filter Bar using Shared PageHeader */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 space-y-3 border-b shadow-xs shrink-0">
        <PageHeader
          title="Compliance Radar"
          icon={Bell}
          badgeCount={filteredAlerts.length}
          badgeLabel="Alerts"
          primaryAction={{
            label: "Mark All Read",
            icon: CheckCheck,
            onClick: handleMarkAllRead,
            variant: "ghost"
          }}
          className="p-2.5 border-none shadow-none bg-transparent"
        />

        <SearchFilterBar
          searchValue={alertSearch}
          onSearchChange={setAlertSearch}
          searchPlaceholder="Search permit, employee, company..."
          statusFilters={categories}
          activeStatusFilter={alertCategoryFilter || ''}
          onStatusFilterChange={(catId) => setAlertCategoryFilter(catId as AlertCategory | '')}
        />
      </header>

      {/* Alert Feed */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
            <div className="w-14 h-14 bg-muted/80 rounded-2xl flex items-center justify-center border">
              <Bell className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No alerts match your filter</p>
              <p className="text-xs text-muted-foreground mt-1">All compliance permits are operating smoothly!</p>
            </div>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <MobileAlertCard 
              key={alert.id} 
              alert={alert} 
              onMarkRead={handleMarkRead}
              onDelete={handleDeleteAlert}
              onTap={(a) => {
                if (a.entityType === 'employee') {
                  handleOpenEmployeeDetails(a.entityId);
                } else {
                  handleOpenCompanyRegistry(a.companyName);
                }
              }}
            />
          ))
        )}
      </main>
    </div>
  );
}
