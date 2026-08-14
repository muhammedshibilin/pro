'use client';

import React from 'react';
import { DesktopApp } from '@/components/desktop/DesktopApp';
import MobileApp from '@/components/mobile/MobileApp';

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Mobile PWA App (< 768px) */}
      <div className="block md:hidden w-full h-full">
        <MobileApp />
      </div>

      {/* Desktop ERP System (>= 768px) */}
      <div className="hidden md:block w-full h-full">
        <DesktopApp />
      </div>
    </div>
  );
}
