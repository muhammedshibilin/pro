'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Users,
  AlertOctagon,
  Settings,
  Menu,
  X,
  Search,
  Bell,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface MenuItem {
  id: 'dashboard' | 'companies' | 'employees' | 'alerts' | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: 'dashboard' | 'companies' | 'employees' | 'alerts' | 'settings';
  onViewChange: (view: 'dashboard' | 'companies' | 'employees' | 'alerts' | 'settings') => void;
  notificationCount?: number;
  onSearchTrigger?: () => void;
}

export function DashboardLayout({
  children,
  activeView,
  onViewChange,
  notificationCount = 0,
  onSearchTrigger,
}: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'alerts', label: 'Alerts', icon: AlertOctagon, badge: notificationCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: typeof activeView) => {
    onViewChange(view);
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-all duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card text-card-foreground shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none">DocExpiry</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">Enterprise</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar for Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-card border-r text-card-foreground z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-none">DocExpiry</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">Enterprise</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="px-4 py-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b bg-card text-card-foreground flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
          {/* Left section: Hamburger trigger + Search bar */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground shrink-0"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop click-to-trigger search bar wrapper */}
            <div
              className="relative w-full hidden sm:block cursor-pointer select-none"
              onClick={onSearchTrigger}
            >
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Global search (Ctrl+K)..."
                className="pl-9 h-9 w-full bg-background pointer-events-none"
                readOnly
              />
            </div>

            {/* Mobile search trigger icon */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-muted-foreground shrink-0"
              onClick={onSearchTrigger}
              aria-label="Global search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Right section: Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewChange('alerts')}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 relative"
              aria-label="View alerts"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-card shadow-sm animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
