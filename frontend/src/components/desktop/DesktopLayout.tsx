'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, LayoutDashboard, Building2, Users, Bell, Settings, Search, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { AppView } from '@/hooks/use-app-data';
import { cn } from '@/lib/utils';

interface DesktopLayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  notificationCount: number;
  onSearchTrigger: () => void;
}

export function DesktopLayout({ children, activeView, onViewChange, notificationCount, onSearchTrigger }: DesktopLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setIsCollapsed(saved === 'true');
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => {
          const next = !prev;
          localStorage.setItem('sidebar-collapsed', String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'alerts', label: 'Compliance Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* ===== SIDEBAR NAV ===== */}
      <aside 
        className={cn(
          "flex flex-col border-r border-border/80 bg-card transition-all duration-300 relative z-20 shadow-lg shadow-black/5",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center h-16 px-4 border-b border-border/60 shrink-0 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-blue-700 text-primary-foreground shadow-md shadow-primary/20 shrink-0">
              <ShieldCheck className="h-6 w-6" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                  DocExpiry
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono tracking-wide">
                  COMPLIANCE HUB
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Nav Items */}
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Navigation
            </span>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as AppView)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold shadow-xs" 
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active Left Pill */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                )}

                <div className="relative shrink-0">
                  <Icon className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-105", isActive ? "text-primary" : "")} />
                  {item.id === 'alerts' && notificationCount > 0 && (
                    <span className={cn(
                      "absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1 border-2 border-card shadow-xs animate-pulse-glow"
                    )}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && <span className="font-sans">{item.label}</span>}
                
                {!isCollapsed && item.id === 'alerts' && notificationCount > 0 && (
                  <span className={cn(
                    "ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold font-mono",
                    isActive ? "bg-primary text-primary-foreground" : "bg-destructive/15 text-destructive"
                  )}>
                    {notificationCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="p-3 mx-3 mb-2 rounded-xl bg-muted/50 border border-border/50 text-xs flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[11px] text-foreground truncate">Live Monitoring</span>
              <span className="text-[10px] font-mono text-muted-foreground truncate">All nodes active</span>
            </div>
          </div>
        )}

        <div className="p-3 border-t border-border/60 shrink-0 flex items-center justify-between">
          {!isCollapsed && (
            <span className="text-[11px] text-muted-foreground font-mono px-2">Ctrl + B toggle</span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg ml-auto" 
            title="Toggle Sidebar (Ctrl+B)"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT AREA ===== */}
      <main className="flex-1 flex flex-col min-w-0 bg-mesh-pattern">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/70 bg-card/80 backdrop-blur-md shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="w-72 justify-start text-muted-foreground bg-muted/40 hover:bg-muted/80 border-border/80 rounded-xl transition-all shadow-xs hover:border-primary/40 group"
              onClick={onSearchTrigger}
            >
              <Search className="mr-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-normal">Search documents, employees...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border bg-background px-1.5 font-mono text-[10px] font-semibold text-muted-foreground opacity-90 border-border">
                <span>⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Alert Bell */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onViewChange('alerts')}
              className="relative text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-colors"
              title="View Alerts"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card animate-pulse" />
              )}
            </Button>

            <div className="h-5 w-px bg-border/80 mx-1" />
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-2 border-l border-border/60">
              <div className="flex flex-col text-right hidden lg:flex">
                <span className="text-xs font-semibold text-foreground leading-none">Compliance Admin</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Enterprise License</span>
              </div>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-primary-foreground font-display font-bold text-sm shadow-md shadow-primary/20 ring-2 ring-primary/20">
                CA
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Scrollable View */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
