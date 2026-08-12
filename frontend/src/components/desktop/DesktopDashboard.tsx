'use client';

import React from 'react';
import { AppData } from '@/hooks/use-app-data';
import { DashboardStatsOverview } from '@/components/dashboard-stats';
import { RecentAlerts, UpcomingExpiries, RecentlyAddedEmployees, CompanyStatusGrid } from '@/components/dashboard-widgets';
import { Button } from '@/components/ui/button';
import { FilePlus, Zap } from 'lucide-react';

interface DesktopDashboardProps {
  appData: AppData;
}

export function DesktopDashboard({ appData }: DesktopDashboardProps) {
  // Calculate real-time overall compliance health percentage
  const totalDocs = appData.documents.length;
  const expiredDocs = appData.counts.expiredCount;
  const compliantDocs = Math.max(0, totalDocs - expiredDocs);
  const healthPercentage = totalDocs > 0 ? Math.round((compliantDocs / totalDocs) * 100) : 100;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* ===== HERO THESIS BANNER (SIGNATURE ELEMENT) ===== */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 md:p-8 shadow-sm">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold tracking-wide">
              <Zap className="h-3.5 w-3.5" />
              <span>Real-time Compliance Horizon</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
              Document Expiry & Risk Radar
            </h1>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              Automated compliance engine tracking company permits, employee visas, and legal documentation. Stay ahead of audit vulnerabilities with zero friction.
            </p>
          </div>

          {/* Dynamic Health Score Metric Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-border/70 shadow-xs shrink-0">
            <div className="flex items-center gap-4 px-2">
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-muted/40"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeDasharray={163}
                    strokeDashoffset={163 - (163 * healthPercentage) / 100}
                    strokeLinecap="round"
                    className={healthPercentage > 85 ? "text-emerald-500" : healthPercentage > 60 ? "text-amber-500" : "text-rose-500"}
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-display font-bold text-sm text-foreground">
                  {healthPercentage}%
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compliance Score</span>
                <span className="text-sm font-bold text-foreground">
                  {healthPercentage > 85 ? 'Healthy & Audit Ready' : healthPercentage > 60 ? 'Attention Recommended' : 'Action Required'}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {compliantDocs} of {totalDocs} docs valid
                </span>
              </div>
            </div>

            <div className="h-full w-px bg-border hidden sm:block" />

            <Button onClick={appData.handleAddDocClick} className="h-11 px-5 rounded-xl shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <FilePlus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
        </div>
      </div>

      {/* ===== 6-CARD STATS OVERVIEW ===== */}
      <DashboardStatsOverview 
        totalCompanies={appData.companies.length}
        totalEmployees={appData.employees.length}
        expiredCount={appData.counts.expiredCount}
        expiringToday={appData.counts.expiringToday}
        expiring7Days={appData.counts.expiring7Days}
        expiring30Days={appData.counts.expiring30Days}
        loading={appData.loading}
        onCardClick={appData.handleCardClick}
      />

      {/* ===== WIDGET GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <RecentAlerts documents={appData.documents} employees={appData.employees} />
        </div>
        <div className="xl:col-span-1">
          <UpcomingExpiries documents={appData.documents} employees={appData.employees} />
        </div>
        <div className="xl:col-span-1">
          <RecentlyAddedEmployees employees={appData.employees} documents={appData.documents} />
        </div>
        <div className="xl:col-span-3">
          <CompanyStatusGrid companies={appData.companies} documents={appData.documents} employees={appData.employees} />
        </div>
      </div>
    </div>
  );
}
