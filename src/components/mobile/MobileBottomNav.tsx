'use client';

import React from 'react';
import { LayoutDashboard, Users, Building2, Bell, Settings } from 'lucide-react';
import { AppView } from '@/hooks/use-app-data';

interface MobileBottomNavProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  alertCount: number;
}

export default function MobileBottomNav({ activeView, onViewChange, alertCount }: MobileBottomNavProps) {
  const tabs = [
    { id: 'dashboard' as AppView, label: 'Home', icon: LayoutDashboard },
    { id: 'companies' as AppView, label: 'Companies', icon: Building2 },
    { id: 'employees' as AppView, label: 'Employees', icon: Users },
    { id: 'alerts' as AppView, label: 'Alerts', icon: Bell },
    { id: 'settings' as AppView, label: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/80 h-16 pb-[max(0.25rem,env(safe-area-inset-bottom))] flex items-center justify-around px-1 shadow-lg select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;
        
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            type="button"
            onClick={() => onViewChange(tab.id)}
            className={`relative flex flex-col items-center justify-center flex-1 h-full min-w-0 py-1 transition-all cursor-pointer active:scale-90 ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-xs" />
            )}
            
            <div className="relative shrink-0">
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              {tab.id === 'alerts' && alertCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold font-mono flex items-center justify-center border-2 border-card shadow-xs">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </div>
            
            <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 truncate max-w-full px-0.5 ${
              isActive ? 'font-bold text-primary' : 'font-medium text-muted-foreground'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
