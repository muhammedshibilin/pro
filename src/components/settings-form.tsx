'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { DocumentUpload } from './document-upload';
import {
  Settings,
  Bell,
  Cloud,
  Check,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const settingsSchema = z.object({
  appName: z.string().min(2, 'Application name must be at least 2 characters'),
  reminderDays: z.number().min(1, 'Warning period must be at least 1 day'),
  theme: z.string(),
  companyLogo: z.string().optional(),
  language: z.string(),
  // Notifications preferences (Switches/Checkboxes simulated as booleans)
  emailAlerts: z.boolean(),
  pushAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  // Backup / S3 settings
  s3BucketName: z.string().optional(),
  s3AccessKey: z.string().optional(),
  s3SecretKey: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS: SettingsFormValues = {
  appName: 'DocExpiry',
  reminderDays: 30,
  theme: 'System',
  companyLogo: '',
  language: 'en',
  emailAlerts: true,
  pushAlerts: true,
  smsAlerts: false,
  s3BucketName: '',
  s3AccessKey: '',
  s3SecretKey: '',
};

interface SettingsFormProps {
  onRecalculate: () => Promise<void>;
  isRecalculating: boolean;
}

export function SettingsForm({ onRecalculate, isRecalculating }: SettingsFormProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_SETTINGS,
  });

  const logoUrl = watch('companyLogo');

  // Load settings on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('system_settings');
      if (stored) {
        try {
          reset(JSON.parse(stored));
        } catch (err) {
          console.error('Failed to parse settings:', err);
        }
      }
    }
  }, [reset]);

  const applyTheme = (theme: string) => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'Dark') {
      root.classList.add('dark');
    } else if (theme === 'Light') {
      root.classList.add('light');
    } else {
      // System default match
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemDark ? 'dark' : 'light');
    }
  };

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      localStorage.setItem('system_settings', JSON.stringify(data));
      applyTheme(data.theme);
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      reset(data); // mark clean
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to restore default configuration?')) {
      reset(DEFAULT_SETTINGS);
      localStorage.setItem('system_settings', JSON.stringify(DEFAULT_SETTINGS));
      applyTheme(DEFAULT_SETTINGS.theme);
      setSuccessMsg('Default configurations restored.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear PWA offline assets cache and reload the application?')) {
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
      window.location.reload();
    }
  };

  const themeOptions = [
    { value: 'System', label: 'Match System Default' },
    { value: 'Light', label: 'Light Mode' },
    { value: 'Dark', label: 'Dark Mode' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English (US)' },
    { value: 'ar', label: 'Arabic' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl text-xs">
      {/* Success banner */}
      {successMsg && (
        <div className="p-3.5 border border-emerald-500/20 rounded-xl bg-emerald-500/5 text-emerald-600 flex items-center gap-2">
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: App Settings */}
        <div className="border rounded-xl bg-card p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
            <Settings className="h-4.5 w-4.5 text-primary" />
            General Settings
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Application Name</label>
              <Input placeholder="DocExpiry" {...register('appName')} />
              {errors.appName && <p className="text-destructive font-semibold">{errors.appName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Reminder Threshold (Days)</label>
              <Input type="number" placeholder="30" {...register('reminderDays', { valueAsNumber: true })} />
              {errors.reminderDays && <p className="text-destructive font-semibold">{errors.reminderDays.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Color Theme</label>
              <Select options={themeOptions} {...register('theme')} />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Display Language</label>
              <Select options={languageOptions} {...register('language')} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Company Logo</label>
            <DocumentUpload
              value={logoUrl || ''}
              onChange={(val) => setValue('companyLogo', val, { shouldDirty: true })}
            />
          </div>
        </div>

        {/* Card 2: Notification Switchboard */}
        <div className="border rounded-xl bg-card p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
              <Bell className="h-4.5 w-4.5 text-primary" />
              Notification Preferences
            </h3>

            <div className="space-y-3.5 pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('emailAlerts')}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="font-bold text-foreground block">Email Expiry Warnings</span>
                  <span className="text-[10px] text-muted-foreground">Receive daily summaries of items warning threshold.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('pushAlerts')}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="font-bold text-foreground block">PWA Browser Push Alerts</span>
                  <span className="text-[10px] text-muted-foreground">Receive instant desktop warning popups.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none opacity-60">
                <input
                  type="checkbox"
                  {...register('smsAlerts')}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  disabled
                />
                <div>
                  <span className="font-bold text-foreground block">SMS Text Warnings (Future)</span>
                  <span className="text-[10px] text-muted-foreground">Receive SMS alerts directly on registered phones.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="p-3 border border-dashed rounded-xl bg-muted/20 flex gap-2 items-start mt-2">
            <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="text-[10px] text-muted-foreground">
              Notifications correspond directly to QID expiries and company CR/Trade licenses.
            </span>
          </div>
        </div>

        {/* Card 3: Cloud Integrations */}
        <div className="border rounded-xl bg-card p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
            <Cloud className="h-4.5 w-4.5 text-primary" />
            Cloud Storage & Backups (AWS S3)
          </h3>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">S3 Bucket Name</label>
            <Input placeholder="docexpiry-backups" {...register('s3BucketName')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">S3 Access Key</label>
              <Input type="password" placeholder="AKIAIOSFODNN7EXAMPLE" {...register('s3AccessKey')} />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">S3 Secret Key</label>
              <Input type="password" placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" {...register('s3SecretKey')} />
            </div>
          </div>
        </div>

        {/* Card 4: Diagnostics */}
        <div className="border rounded-xl bg-card p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
              <AlertCircle className="h-4.5 w-4.5 text-primary" />
              Diagnostics & Maintenance
            </h3>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-foreground block">Recalculate Expiries</span>
                  <span className="text-[10px] text-muted-foreground">Trigger manual status recalculations.</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onRecalculate}
                  disabled={isRecalculating}
                  className="gap-1"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                  <span>Scan DB</span>
                </Button>
              </div>

              <div className="flex items-center justify-between gap-4 border-t pt-3">
                <div>
                  <span className="font-bold text-foreground block">Flush PWA Cache</span>
                  <span className="text-[10px] text-muted-foreground">Clear service worker local assets cache.</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearCache}
                  className="text-rose-600 hover:text-rose-600 hover:bg-rose-500/10"
                >
                  Clear Cache
                </Button>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground text-center border-t pt-3">
            DocExpiry PWA v1.0.0 &bull; Offline Database Mock Fallbacks Engaged
          </div>
        </div>
      </div>

      {/* Save / Reset Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Restore Defaults
        </Button>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </form>
  );
}
