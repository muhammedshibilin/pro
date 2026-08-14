'use client';

import React from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Search, UserPlus, Building2, FileText, Bell, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import MobileAlertCard from './MobileAlertCard';

interface MobileDashboardProps {
  appData: AppData;
}

export default function MobileDashboard({ appData }: MobileDashboardProps) {
  const { 
    counts, 
    allAlerts, 
    setActiveView, 
    setIsSearchOpen,
    handleMarkRead,
    handleDeleteAlert,
    handleAddDocClick
  } = appData;

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  
  const todayExpiries = allAlerts.filter(a => a.category === 'Today');
  const upcomingRenewals = allAlerts.filter(a => a.category !== 'Expired' && a.category !== 'Today').slice(0, 6);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto pb-28">
      {/* Top Banner Header */}
      <div className="p-4 pt-6 bg-card border-b rounded-b-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground font-display">DocExpiry</h1>
              <p className="text-[11px] text-muted-foreground font-medium">{todayStr}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 bg-muted/80 hover:bg-muted rounded-full flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div 
            onClick={() => { appData.setAlertCategoryFilter('Expired'); setActiveView('alerts'); }} 
            className="bg-rose-500/10 dark:bg-rose-950/20 p-3.5 rounded-2xl border border-rose-500/20 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-rose-600 dark:text-rose-400 font-semibold text-xs">Expired</h3>
              <ArrowUpRight className="h-3.5 w-3.5 text-rose-500/60" />
            </div>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1 font-mono">{counts.expiredCount}</p>
          </div>

          <div 
            onClick={() => { appData.setAlertCategoryFilter('Today'); setActiveView('alerts'); }} 
            className="bg-orange-500/10 dark:bg-orange-950/20 p-3.5 rounded-2xl border border-orange-500/20 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-orange-600 dark:text-orange-400 font-semibold text-xs">Due Today</h3>
              <ArrowUpRight className="h-3.5 w-3.5 text-orange-500/60" />
            </div>
            <p className="text-2xl font-black text-orange-700 dark:text-orange-300 mt-1 font-mono">{counts.expiringToday}</p>
          </div>

          <div 
            onClick={() => { appData.setAlertCategoryFilter('7 Days'); setActiveView('alerts'); }} 
            className="bg-amber-500/10 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-500/20 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-amber-600 dark:text-amber-400 font-semibold text-xs">Next 7 Days</h3>
              <ArrowUpRight className="h-3.5 w-3.5 text-amber-500/60" />
            </div>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1 font-mono">{counts.expiring7Days}</p>
          </div>

          <div 
            onClick={() => { appData.setAlertCategoryFilter('30 Days'); setActiveView('alerts'); }} 
            className="bg-blue-500/10 dark:bg-blue-950/20 p-3.5 rounded-2xl border border-blue-500/20 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-blue-600 dark:text-blue-400 font-semibold text-xs">Next 30 Days</h3>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-500/60" />
            </div>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1 font-mono">{counts.expiring30Days}</p>
          </div>
        </div>
      </div>

      {/* Today's Expiries Horizontal Scroll */}
      {todayExpiries.length > 0 && (
        <div className="mt-5 px-4">
          <h2 className="text-sm font-bold mb-2.5 flex items-center gap-1.5 text-foreground">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Today&apos;s Expiries ({todayExpiries.length})
          </h2>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
            {todayExpiries.map(alert => (
              <div key={alert.id} className="w-[85vw] max-w-[340px] shrink-0 snap-center">
                <MobileAlertCard 
                  alert={alert} 
                  onMarkRead={handleMarkRead}
                  onDelete={handleDeleteAlert}
                  onTap={(a) => {
                    if (a.entityType === 'employee') {
                      appData.handleOpenEmployeeDetails(a.entityId);
                    } else {
                      appData.handleOpenCompanyRegistry(a.companyName);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-5 px-4">
        <h2 className="text-sm font-bold mb-2.5 text-foreground">Quick Shortcuts</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <button 
            onClick={() => setActiveView('employees')}
            className="flex items-center gap-3 p-3 bg-card border rounded-2xl active:scale-95 transition-transform shadow-xs text-left"
          >
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-foreground">Personnel</span>
              <span className="text-[10px] text-muted-foreground">Manage Staff</span>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveView('companies')}
            className="flex items-center gap-3 p-3 bg-card border rounded-2xl active:scale-95 transition-transform shadow-xs text-left"
          >
            <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-foreground">Companies</span>
              <span className="text-[10px] text-muted-foreground">CR & Licenses</span>
            </div>
          </button>

          <button 
            onClick={() => handleAddDocClick()}
            className="flex items-center gap-3 p-3 bg-card border rounded-2xl active:scale-95 transition-transform shadow-xs text-left"
          >
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-foreground">Documents</span>
              <span className="text-[10px] text-muted-foreground">Add Permit</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveView('alerts')}
            className="flex items-center gap-3 p-3 bg-card border rounded-2xl active:scale-95 transition-transform shadow-xs text-left"
          >
            <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-foreground">Radar</span>
              <span className="text-[10px] text-muted-foreground">All Alerts</span>
            </div>
          </button>
        </div>
      </div>

      {/* Upcoming Renewals List */}
      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-foreground">Upcoming Renewals</h2>
          <button onClick={() => setActiveView('alerts')} className="text-xs text-primary font-semibold">View All</button>
        </div>
        <div className="space-y-2.5">
          {upcomingRenewals.length > 0 ? (
            upcomingRenewals.map(alert => (
              <MobileAlertCard 
                key={alert.id} 
                alert={alert} 
                onMarkRead={handleMarkRead}
                onDelete={handleDeleteAlert}
                onTap={(a) => {
                  if (a.entityType === 'employee') {
                    appData.handleOpenEmployeeDetails(a.entityId);
                  } else {
                    appData.handleOpenCompanyRegistry(a.companyName);
                  }
                }}
              />
            ))
          ) : (
            <div className="text-center p-6 bg-muted/40 rounded-2xl border border-dashed">
              <p className="text-muted-foreground text-xs">No upcoming renewals in the next 30 days.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
