'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // In development mode, unregister any active PWA service worker and clear cache storage
      // so stale cached HTML ("Loading dashboard...") doesn't hijack dev live-reloading.
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((keys) => {
            keys.forEach((key) => caches.delete(key));
          });
        }
        return;
      }

      const registerSW = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          console.log('PWA Service Worker registered scope:', reg.scope);
        } catch (error) {
          console.error('PWA Service Worker registration failed:', error);
        }
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}
