'use client';

import React, { useEffect, useState } from 'react';
import { Download, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Detect if already in standalone mode
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }

      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener('beforeinstallprompt', handler);
      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
      });

      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || dismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-card/95 backdrop-blur-md border border-primary/30 p-3.5 rounded-2xl shadow-xl animate-fade-in flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-foreground leading-tight">Install DocExpiry App</h4>
          <p className="text-[10px] text-muted-foreground">Fast access & offline alerts on your device</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          onClick={handleInstallClick}
          className="h-8 text-xs font-semibold bg-primary text-primary-foreground px-3 gap-1 rounded-xl shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
