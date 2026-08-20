'use client';

import React, { useState } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { SettingsForm } from '@/components/settings-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { Settings, RefreshCw, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared';

interface MobileSettingsProps {
  appData: AppData;
}

export default function MobileSettings({ appData }: MobileSettingsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleClearCacheAndUpdate = async () => {
    setIsUpdating(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }
      setUpdateSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error('Failed to clear cache:', err);
      window.location.reload();
    } finally {
      setIsUpdating(false);
    }
  };

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
        {/* Theme Setting */}
        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border shadow-xs">
          <div>
            <h3 className="font-bold text-sm text-foreground">Theme Preference</h3>
            <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>

        {/* PWA Home Screen Update & Cache Clear */}
        <div className="p-4 bg-card rounded-2xl border shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-foreground">Mobile Home Screen App Updates</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                If changes made on the web are not showing on your mobile phone home screen app, tap below to clear stored cache and fetch the latest version.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleClearCacheAndUpdate}
            disabled={isUpdating}
            className="w-full h-11 text-xs font-bold gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
          >
            {updateSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Updated! Reloading...</span>
              </>
            ) : (
              <>
                <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'Clearing Cache...' : 'Force App Update & Clear Cache'}</span>
              </>
            )}
          </Button>
        </div>

        {/* Status Recalculation Form */}
        <div className="bg-card rounded-2xl border p-4 sm:p-5 shadow-xs">
          <SettingsForm onRecalculate={appData.handleRecalculate} isRecalculating={appData.isRecalculating} />
        </div>
      </main>
    </div>
  );
}

