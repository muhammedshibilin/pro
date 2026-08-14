/**
 * Centralized Expiry & Compliance Status Calculator Engine
 *
 * Source of truth for all business status rules:
 *
 * 1. EMPLOYEE QID STATUS (4 statuses based on calendar-month after expiry):
 *    - SAFE (🟢 GREEN): Before expiry, including the final month before expiry (today <= expiryDate).
 *    - MONTH_1_EXPIRED (⚫ BLACK): From expiry date until 1 month after expiry (expiryDate < today <= +1 calendar month).
 *    - MONTH_2_EXPIRED (🟡 YELLOW): 2nd month after expiry (+1 month < today <= +2 calendar months).
 *    - MONTH_3_EXPIRED (🔴 RED): 3rd month after expiry (+2 months < today <= +3 calendar months).
 *    - FULLY_EXPIRED (⚪ OUTSIDE): After 3 months (> +3 calendar months).
 *
 * 2. COMPANY DOCUMENTS (3 statuses based on calendar-month before expiry for CR, Trade License, Computer Card, etc.):
 *    - SAFE (🟢 GREEN): More than 2 months before expiry / 3+ months remaining (today < 2 months before expiry).
 *    - WARNING (🟡 YELLOW): 2 months before expiry (from 2 months before up to 1 month before expiry).
 *    - DANGER (🔴 RED): Final month before expiry and remains red after expiry (today within 1 month before expiry or past expiry).
 */

export type EmployeeQidStatus = 
  | 'SAFE'             // 🟢 Safe / Before Expiry
  | 'MONTH_1_EXPIRED'  // ⚫ 1st Month Expired
  | 'MONTH_2_EXPIRED'  // 🟡 2nd Month Expired
  | 'MONTH_3_EXPIRED'  // 🔴 3rd Month Expired
  | 'FULLY_EXPIRED';   // ⚪ Fully Expired (> 3 months)

export type CompanyDocumentStatus = 
  | 'SAFE'     // 🟢 Safe (3+ months remaining)
  | 'WARNING'  // 🟡 Warning (2 months remaining)
  | 'DANGER';   // 🔴 Danger (1 month remaining or Expired)

/**
 * Adds or subtracts exact calendar months to a Date.
 * Handles month-end date clamping (e.g. Aug 31 + 1 month -> Sep 30).
 */
export function addCalendarMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const originalDay = d.getDate();
  
  d.setMonth(d.getMonth() + months);
  
  // If the day shifted due to month length difference (e.g., Feb 31 -> March 3), clamp to last day of target month
  if (d.getDate() !== originalDay) {
    d.setDate(0);
  }
  return d;
}

/**
 * Normalizes a date to start-of-day (00:00:00.000) for accurate calendar comparison.
 */
export function normalizeDate(dateInput: string | Date): Date {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculates Employee QID Status based on the 4-status calendar month rule.
 */
export function calculateEmployeeQidStatus(
  expiryDateInput: string | Date | null | undefined,
  referenceDateInput?: string | Date
): EmployeeQidStatus {
  if (!expiryDateInput) return 'SAFE';

  const expiry = normalizeDate(expiryDateInput);
  const today = normalizeDate(referenceDateInput || new Date());

  // 🟢 1. Before expiry (including final month and day of expiry)
  if (today <= expiry) {
    return 'SAFE';
  }

  // ⚫ 2. 1st Month Expired: From expiry date until 1 month after expiry
  const oneMonthAfter = addCalendarMonths(expiry, 1);
  if (today <= oneMonthAfter) {
    return 'MONTH_1_EXPIRED';
  }

  // 🟡 3. 2nd Month Expired: 2nd month after expiry
  const twoMonthsAfter = addCalendarMonths(expiry, 2);
  if (today <= twoMonthsAfter) {
    return 'MONTH_2_EXPIRED';
  }

  // 🔴 4. 3rd Month Expired: 3rd month after expiry
  const threeMonthsAfter = addCalendarMonths(expiry, 3);
  if (today <= threeMonthsAfter) {
    return 'MONTH_3_EXPIRED';
  }

  // After 3 months: Fully Expired / outside tracking period
  return 'FULLY_EXPIRED';
}

/**
 * Calculates Company Document Status (CR, Trade License, Computer Card, etc.)
 * based on the 3-status calendar month rule.
 */
export function calculateCompanyDocumentStatus(
  expiryDateInput: string | Date | null | undefined,
  referenceDateInput?: string | Date
): CompanyDocumentStatus {
  if (!expiryDateInput) return 'SAFE';

  const expiry = normalizeDate(expiryDateInput);
  const today = normalizeDate(referenceDateInput || new Date());

  const twoMonthsBefore = addCalendarMonths(expiry, -2);
  const oneMonthBefore = addCalendarMonths(expiry, -1);

  // 🟢 1. More than 2 months before expiry / 3+ months remaining
  if (today < twoMonthsBefore) {
    return 'SAFE';
  }

  // 🟡 2. 2 months before expiry (from 2 months before up to 1 month before)
  if (today < oneMonthBefore) {
    return 'WARNING';
  }

  // 🔴 3. Final month before expiry (within 1 month) and remains red after expiry
  return 'DANGER';
}

/**
 * UI Metadata & Styling helpers for Employee QID Status
 */
export const EMPLOYEE_STATUS_META: Record<
  EmployeeQidStatus,
  {
    label: string;
    shortLabel: string;
    description: string;
    color: 'green' | 'black' | 'yellow' | 'red' | 'gray';
    bgClass: string;
    textClass: string;
    borderClass: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  SAFE: {
    label: 'Safe',
    shortLabel: 'Safe',
    description: 'Before Expiry / Compliant',
    color: 'green',
    bgClass: 'bg-emerald-500 text-white dark:bg-emerald-600',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
  },
  MONTH_1_EXPIRED: {
    label: '1st Month Expired',
    shortLabel: '1st Mo Exp',
    description: 'Expired (0–1 Month)',
    color: 'black',
    bgClass: 'bg-zinc-900 text-white dark:bg-zinc-950 border border-zinc-700',
    textClass: 'text-zinc-900 dark:text-zinc-100',
    borderClass: 'border-zinc-800',
    badgeBg: 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100',
    badgeText: 'text-zinc-100',
    badgeBorder: 'border-zinc-700',
  },
  MONTH_2_EXPIRED: {
    label: '2nd Month Expired',
    shortLabel: '2nd Mo Exp',
    description: 'Expired (1–2 Months)',
    color: 'yellow',
    bgClass: 'bg-amber-400 text-amber-950 dark:bg-amber-500 dark:text-amber-950 font-bold',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-500/40',
    badgeBg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-500/30',
  },
  MONTH_3_EXPIRED: {
    label: '3rd Month Expired',
    shortLabel: '3rd Mo Exp',
    description: 'Expired (2–3 Months)',
    color: 'red',
    bgClass: 'bg-rose-600 text-white dark:bg-rose-700',
    textClass: 'text-rose-700 dark:text-rose-400',
    borderClass: 'border-rose-500/40',
    badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
    badgeText: 'text-rose-700 dark:text-rose-400',
    badgeBorder: 'border-rose-500/30',
  },
  FULLY_EXPIRED: {
    label: 'Fully Expired',
    shortLabel: 'Outside (3+ Mo)',
    description: 'Past 3 Months / Archived',
    color: 'gray',
    bgClass: 'bg-slate-700 text-white dark:bg-slate-800',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-500/30',
    badgeBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-500/30',
  },
};

/**
 * UI Metadata & Styling helpers for Company Document Status
 */
export const COMPANY_DOC_STATUS_META: Record<
  CompanyDocumentStatus,
  {
    label: string;
    shortLabel: string;
    description: string;
    color: 'green' | 'yellow' | 'red';
    bgClass: string;
    textClass: string;
    borderClass: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  SAFE: {
    label: 'Safe',
    shortLabel: 'Safe (3+ Mo)',
    description: '3+ Months Remaining',
    color: 'green',
    bgClass: 'bg-emerald-500 text-white dark:bg-emerald-600',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
  },
  WARNING: {
    label: 'Warning',
    shortLabel: 'Warning (2 Mo)',
    description: '2 Months Before Expiry',
    color: 'yellow',
    bgClass: 'bg-amber-400 text-amber-950 dark:bg-amber-500 dark:text-amber-950 font-bold',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-500/40',
    badgeBg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-500/30',
  },
  DANGER: {
    label: 'Danger',
    shortLabel: 'Danger (<1 Mo / Exp)',
    description: 'Final Month or Expired',
    color: 'red',
    bgClass: 'bg-rose-600 text-white dark:bg-rose-700',
    textClass: 'text-rose-700 dark:text-rose-400',
    borderClass: 'border-rose-500/40',
    badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
    badgeText: 'text-rose-700 dark:text-rose-400',
    badgeBorder: 'border-rose-500/30',
  },
};
