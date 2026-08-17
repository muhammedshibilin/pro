'use client';

import React from 'react';
import { AppData } from '@/hooks/use-app-data';
import { SettingsForm } from '@/components/settings-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared';

interface MobileSettingsProps {
  appData: AppData;
}

export default function MobileSettings({ appData }: MobileSettingsProps) {
  return (
    <div className="flex flex-col h-full w-full max-w-full bg-background overflow-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b shadow-xs shrink-0">
        <PageHeader
          title="System Settings"
          icon={Settings}
          className="p-2.5 border-none shadow-none bg-transparent"
        />
      </header>

      {/* Settings Form Container */}
      <main className="flex-1 overflow-y-auto p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] space-y-4">
        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border shadow-xs">
          <div>
            <h3 className="font-bold text-sm text-foreground">Theme Preference</h3>
            <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="bg-card rounded-2xl border p-4 sm:p-5 shadow-xs">
          <SettingsForm onRecalculate={appData.handleRecalculate} isRecalculating={appData.isRecalculating} />
        </div>
      </main>
    </div>
  );
}
