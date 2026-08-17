'use client';

import React from 'react';
import { LayoutDashboard, Users, Building2, Bell, Settings } from 'lucide-react';
import { AppView } from '@/hooks/use-app-data';
import { cn } from '@/lib/utils';

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
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/80 min-h-[64px] pb-[env(safe-area-inset-bottom,0px)] flex items-center justify-around px-1 shadow-lg select-none"
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
            aria-label={tab.label}
            className={cn(
              "relative flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 px-1 transition-all cursor-pointer min-w-[44px] active:scale-95",
              isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground font-medium"
            )}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-xs" />
            )}
            
            <div className="relative shrink-0 flex items-center justify-center h-6 w-6">
              <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              {tab.id === 'alerts' && alertCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white rounded-full text-[10px] font-bold font-mono flex items-center justify-center border-2 border-card shadow-xs">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </div>
            
            <span className={cn(
              "text-[11px] leading-none mt-1 truncate max-w-full font-sans tracking-tight",
              isActive ? "text-primary font-bold" : "text-muted-foreground font-medium"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
