'use client';

import React from 'react';
import { AppData, AlertCategory } from '@/hooks/use-app-data';
import { Search, Bell, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MobileAlertCard from './MobileAlertCard';

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

  const categories: { id: string; label: string }[] = [
    { id: '', label: 'All Alerts' },
    { id: '1st Month Expired', label: '⚫ 1st Mo Expired' },
    { id: '2nd Month Expired', label: '🟡 2nd Mo Expired' },
    { id: '3rd Month Expired', label: '🔴 3rd Mo Expired' },
    { id: 'Danger', label: '🔴 Danger (<1 Mo / Exp)' },
    { id: 'Warning', label: '🟡 Warning (2 Mo)' },
    { id: 'Fully Expired', label: '⚪ Outside (3+ Mo)' },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Sticky Header & Filter Chips */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 space-y-3 border-b shadow-xs shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-foreground font-display flex items-center gap-2 truncate">
            <Bell className="w-5 h-5 text-primary shrink-0" />
            <span>Compliance Attention Radar</span>
          </h1>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline active:scale-95 transition-transform shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={alertSearch}
            onChange={(e) => setAlertSearch(e.target.value)}
            placeholder="Search permit, employee, company..." 
            className="w-full h-11 pl-10 rounded-xl bg-muted/60 border-none text-sm"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id || 'all'}
              onClick={() => setAlertCategoryFilter(cat.id as AlertCategory | '')}
              className={`flex-shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-all ${
                alertCategoryFilter === cat.id
                  ? 'bg-primary text-primary-foreground shadow-xs' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Alert Feed */}
      <main className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))]">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
            <div className="w-14 h-14 bg-muted/80 rounded-2xl flex items-center justify-center">
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
