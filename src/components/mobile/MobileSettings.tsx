'use client';

import React from 'react';
import { AppData } from '@/hooks/use-app-data';
import { SettingsForm } from '@/components/settings-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { Settings } from 'lucide-react';

interface MobileSettingsProps {
  appData: AppData;
}

export default function MobileSettings({ appData }: MobileSettingsProps) {
  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b flex items-center justify-between shadow-xs shrink-0">
        <h1 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary shrink-0" />
          <span>System Settings</span>
        </h1>
        <ThemeToggle />
      </header>

      {/* Settings Form Container */}
      <main className="flex-1 overflow-y-auto p-4 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] space-y-4">
        <div className="bg-card rounded-2xl border p-4 sm:p-5 shadow-xs">
          <SettingsForm onRecalculate={appData.handleRecalculate} isRecalculating={appData.isRecalculating} />
        </div>
      </main>
    </div>
  );
}
