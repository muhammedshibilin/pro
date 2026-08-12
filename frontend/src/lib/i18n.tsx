'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SupportedLocale } from '@/types';

/**
 * Internationalization (i18n) context.
 *
 * Current state: English only. Arabic keys exist in the scaffold but return
 * an empty string (falls back to English).
 *
 * To activate Arabic:
 *   1. Create /public/locales/ar.json with Arabic translations.
 *   2. Load translations in loadTranslations() based on locale.
 *   3. Set <html dir="rtl" lang="ar"> in layout.tsx when locale === 'ar'.
 *   4. Load Noto Naskh Arabic font from Google Fonts for Arabic text.
 *   5. Use Tailwind logical CSS properties (ms-*, me-*, ps-*, pe-*).
 */

type TranslationMap = Record<string, string>;

// English translations — the single source of truth for UI strings.
const EN: TranslationMap = {
  'app.name': 'DocExpiry Manager',
  'nav.dashboard': 'Dashboard',
  'nav.companies': 'Companies',
  'nav.employees': 'Employees',
  'nav.alerts': 'Alerts',
  'nav.settings': 'Settings',
  'status.active': 'Active',
  'status.inactive': 'Inactive',
  'status.expired': 'Expired',
  'status.expiring_soon': 'Expiring Soon',
  'document.cr': 'Commercial Registration',
  'document.trade_license': 'Trade License',
  'document.computer_card': 'Computer Card',
  'document.qid': 'Qatar ID',
  'action.add': 'Add',
  'action.edit': 'Edit',
  'action.delete': 'Delete',
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.export': 'Export',
  'action.upload': 'Upload',
};

// Arabic scaffold — fill values when Arabic locale is activated.
const AR: TranslationMap = {
  'app.name': 'مدير انتهاء الوثائق',
  'nav.dashboard': 'لوحة التحكم',
  'nav.companies': 'الشركات',
  'nav.employees': 'الموظفون',
  'nav.alerts': 'التنبيهات',
  'nav.settings': 'الإعدادات',
  'status.active': 'نشط',
  'status.inactive': 'غير نشط',
  'status.expired': 'منتهي',
  'status.expiring_soon': 'ينتهي قريبًا',
  'document.cr': 'السجل التجاري',
  'document.trade_license': 'الرخصة التجارية',
  'document.computer_card': 'البطاقة الحاسوبية',
  'document.qid': 'الهوية القطرية',
  'action.add': 'إضافة',
  'action.edit': 'تعديل',
  'action.delete': 'حذف',
  'action.save': 'حفظ',
  'action.cancel': 'إلغاء',
  'action.export': 'تصدير',
  'action.upload': 'رفع',
};

const TRANSLATIONS: Record<SupportedLocale, TranslationMap> = { en: EN, ar: AR };

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as SupportedLocale | null;
    if (saved && ['en', 'ar'].includes(saved)) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    // @future: document.documentElement.lang = newLocale;
    // @future: document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      const map = TRANSLATIONS[locale] ?? EN;
      let text = map[key] ?? EN[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replaceAll(`{{${k}}}`, v);
        });
      }
      return text;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRtl: locale === 'ar' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}
