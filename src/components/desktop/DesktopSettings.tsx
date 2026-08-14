'use client';

import React from 'react';
import { AppData } from '@/hooks/use-app-data';
import { SettingsForm } from '@/components/settings-form';

interface DesktopSettingsProps {
  appData: AppData;
}

export function DesktopSettings({ appData }: DesktopSettingsProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">System Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage application settings and preferences</p>
      </div>
      
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <SettingsForm onRecalculate={appData.handleRecalculate} isRecalculating={appData.isRecalculating} />
      </div>
    </div>
  );
}
