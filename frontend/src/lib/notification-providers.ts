/**
 * Frontend notification provider abstraction.
 *
 * Current implementation: BrowserPushProvider (uses native Web Notifications API).
 * Future implementations: EmailTriggerProvider, WhatsAppTriggerProvider, SmsTriggerProvider.
 *
 * To add a new channel:
 *   1. Implement IFrontendNotificationProvider.
 *   2. Add to the activeProviders array in notificationManager.
 *   3. Zero changes needed in alert-card.tsx or notification-service.ts.
 */

export interface FrontendNotificationPayload {
  title: string;
  body: string;
  /** Optional URL to navigate to when notification is clicked */
  url?: string;
  /** Icon URL for the notification */
  icon?: string;
  /** Arbitrary metadata for the specific provider */
  metadata?: Record<string, unknown>;
}

export interface IFrontendNotificationProvider {
  readonly channelName: string;
  /** Returns true if this channel is available and configured */
  isAvailable(): boolean;
  /** Send a notification through this channel */
  send(payload: FrontendNotificationPayload): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser Push Provider (active)
// ─────────────────────────────────────────────────────────────────────────────

export class BrowserPushProvider implements IFrontendNotificationProvider {
  readonly channelName = 'browser-push';

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  async send(payload: FrontendNotificationPayload): Promise<void> {
    if (!this.isAvailable()) return;
    if (Notification.permission !== 'granted') return;

    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon ?? '/icons/icon-192x192.jpg',
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stub providers — trigger backend API calls when implemented
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @future Implement by calling POST /api/notifications/email
 * Backend EmailProvider (SendGrid/SES) handles the actual delivery.
 */
export class EmailTriggerProvider implements IFrontendNotificationProvider {
  readonly channelName = 'email';
  isAvailable(): boolean { return false; /* Not yet implemented */ }
  async send(_payload: FrontendNotificationPayload): Promise<void> {
    console.warn('[EmailTriggerProvider] Not implemented. Wire POST /api/notifications/email.');
  }
}

/**
 * @future Implement by calling POST /api/notifications/whatsapp
 */
export class WhatsAppTriggerProvider implements IFrontendNotificationProvider {
  readonly channelName = 'whatsapp';
  isAvailable(): boolean { return false; }
  async send(_payload: FrontendNotificationPayload): Promise<void> {
    console.warn('[WhatsAppTriggerProvider] Not implemented. Wire POST /api/notifications/whatsapp.');
  }
}

/**
 * @future Implement by calling POST /api/notifications/sms
 */
export class SmsTriggerProvider implements IFrontendNotificationProvider {
  readonly channelName = 'sms';
  isAvailable(): boolean { return false; }
  async send(_payload: FrontendNotificationPayload): Promise<void> {
    console.warn('[SmsTriggerProvider] Not implemented. Wire POST /api/notifications/sms.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Manager — orchestrates all providers
// ─────────────────────────────────────────────────────────────────────────────

class NotificationManager {
  private readonly providers: IFrontendNotificationProvider[] = [
    new BrowserPushProvider(),
    new EmailTriggerProvider(),
    new WhatsAppTriggerProvider(),
    new SmsTriggerProvider(),
  ];

  /** Send through all available (non-stub) channels */
  async sendAll(payload: FrontendNotificationPayload): Promise<void> {
    const available = this.providers.filter((p) => p.isAvailable());
    await Promise.allSettled(available.map((p) => p.send(payload)));
  }

  /** Send through a specific named channel only */
  async sendVia(channelName: string, payload: FrontendNotificationPayload): Promise<void> {
    const provider = this.providers.find((p) => p.channelName === channelName);
    if (!provider?.isAvailable()) return;
    await provider.send(payload);
  }
}

/** Singleton notification manager instance. */
export const notificationManager = new NotificationManager();
