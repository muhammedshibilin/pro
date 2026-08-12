'use client';

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }

  static async sendNotification(title: string, options?: NotificationOptions) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            registration.showNotification(title, {
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png',
              ...options,
            });
            return;
          }
        } catch (err) {
          console.warn('Service worker notification failed, falling back to standard notification:', err);
        }
      }
      
      try {
        new Notification(title, options);
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }
  }
}
