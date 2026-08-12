'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 dark:bg-amber-700 text-white text-xs md:text-sm py-2 px-4 flex items-center justify-center gap-2 w-full z-50 sticky top-0 shadow-md transition-all duration-300">
      <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
      <span>Offline Mode: Viewing cached data. Creating/editing documents is disabled.</span>
    </div>
  );
}
