'use client';

import { useDeviceType } from '@/hooks/use-device';
import { DesktopApp } from '@/components/desktop/DesktopApp';
import MobileApp from '@/components/mobile/MobileApp';

export default function Home() {
  const { isMobile } = useDeviceType();

  // Directly render purpose-built interface for device layout
  return isMobile ? <MobileApp /> : <DesktopApp />;
}
