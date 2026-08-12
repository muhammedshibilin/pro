'use client';

import React from 'react';
import { AppData, AlertSortKey } from '@/hooks/use-app-data';
import { DesktopFilterPanel } from './DesktopFilterPanel';
import { AlertCard } from '@/components/alert-card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { BellRing, RefreshCw, ArrowUp, ArrowDown, ShieldCheck } from 'lucide-react';

interface DesktopAlertListProps {
  appData: AppData;
}

export function DesktopAlertList({ appData }: DesktopAlertListProps) {
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in space-y-2">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-foreground">Compliance Alerts Engine</h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
              {appData.filteredAlerts.length} Active Warnings
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">Real-time risk warnings, document expiration schedules, and push notifications.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={appData.handleRequestPush} className="rounded-xl h-10 px-4 text-xs font-semibold border-border/80">
            <BellRing className="h-4 w-4 mr-2 text-primary" />
            Enable Push Notifications
          </Button>
          <Button onClick={appData.handleRecalculate} disabled={appData.isRecalculating} className="rounded-xl shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-4 text-xs">
            <RefreshCw className={`h-4 w-4 mr-2 ${appData.isRecalculating ? 'animate-spin' : ''}`} />
            Recalculate Risk Engine
          </Button>
        </div>
      </div>

      <DesktopFilterPanel searchValue={appData.alertSearch} onSearchChange={appData.setAlertSearch}>
        <Select 
          options={[
            { value: 'all', label: 'All Categories' },
            { value: 'expired', label: 'Critical Expired' },
            { value: 'today', label: 'Expiring Today' },
            { value: '7days', label: '7 Days Horizon' },
            { value: '15days', label: '15 Days Horizon' },
            { value: '30days', label: '30 Days Horizon' },
          ]}
          value={appData.alertCategoryFilter}
          onChange={(e) => appData.setAlertCategoryFilter(e.target.value)}
        />
        <Select 
          options={[
            { value: 'all', label: 'All Read States' },
            { value: 'unread', label: 'Unread Warnings' },
            { value: 'read', label: 'Archived / Read' },
          ]}
          value={appData.alertReadFilter}
          onChange={(e) => appData.setAlertReadFilter(e.target.value)}
        />
        <Select 
          options={[
            { value: 'daysRemaining', label: 'Sort: Urgency / Days' },
            { value: 'documentType', label: 'Sort: Document Type' },
            { value: 'companyName', label: 'Sort: Company Entity' },
          ]}
          value={appData.alertSortBy}
          onChange={(e) => appData.setAlertSortBy(e.target.value as AlertSortKey)}
        />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => appData.setAlertSortOrder(appData.alertSortOrder === 'asc' ? 'desc' : 'asc')}
          title="Toggle Sort Order"
          className="rounded-xl h-10 w-10 shrink-0"
        >
          {appData.alertSortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
      </DesktopFilterPanel>

      {appData.filteredAlerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appData.filteredAlerts.map(alert => (
            <AlertCard 
              key={alert.id}
              alert={alert}
              onMarkRead={() => appData.handleMarkRead(alert.id)}
              onDelete={() => appData.handleDeleteAlert(alert.id)}
              onOpenEmployee={appData.handleOpenEmployeeDetails}
              onOpenCompany={appData.handleOpenCompanyRegistry}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="font-display font-bold text-base text-foreground">Zero Active Compliance Warnings</h3>
          <p className="text-muted-foreground text-xs max-w-sm">No document expiration alerts match your selected filter criteria. All monitored items are in good standing.</p>
        </div>
      )}
    </div>
  );
}
