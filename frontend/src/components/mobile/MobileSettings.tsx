'use client';

import React from 'react';
import { AppData } from '@/hooks/use-app-data';
import { SettingsForm } from '@/components/settings-form';
import { ThemeToggle } from '@/components/theme-toggle';

interface MobileSettingsProps {
  appData: AppData;
}

export default function MobileSettings({ appData }: MobileSettingsProps) {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold">Settings</h1>
        <ThemeToggle />
      </div>

      <div className="p-4 pb-24">
        <div className="bg-card rounded-2xl border p-5 shadow-sm">
          <SettingsForm onRecalculate={appData.handleRecalculate} isRecalculating={appData.isRecalculating} />
        </div>
      </div>
    </div>
  );
}
