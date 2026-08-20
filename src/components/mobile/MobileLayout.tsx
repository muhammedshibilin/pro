'use client';

import React from 'react';
import { AppView } from '@/hooks/use-app-data';
import MobileBottomNav from './MobileBottomNav';
import MobileFAB from './MobileFAB';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  alertCount: number;
  onAddEmployee: () => void;
  onAddCompany: () => void;
  onAddDocument: () => void;
  isHideNav?: boolean;
}

export default function MobileLayout({
  children,
  activeView,
  onViewChange,
  alertCount,
  onAddEmployee,
  onAddCompany,
  onAddDocument,
  isHideNav = false,
}: MobileLayoutProps) {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden relative">
      <main className="flex-1 overflow-hidden relative z-0">
        {children}
      </main>

      {!isHideNav && activeView === 'dashboard' && (
        <MobileFAB 
          onAddEmployee={onAddEmployee}
          onAddCompany={onAddCompany}
          onAddDocument={onAddDocument}
        />
      )}

      {!isHideNav && (
        <MobileBottomNav 
          activeView={activeView}
          onViewChange={onViewChange}
          alertCount={alertCount}
        />
      )}
    </div>
  );
}

