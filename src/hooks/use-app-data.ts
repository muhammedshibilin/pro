'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDocuments, useRecalculateDocuments } from '@/hooks/use-documents';
import { useEmployees } from '@/hooks/use-employees';
import { useCompanies } from '@/hooks/use-companies';
import { getDaysRemaining } from '@/lib/utils';
import { Document, Employee, Company } from '@/types';
import { NotificationService } from '@/lib/notification-service';

// ─── Alert Item type (shared across desktop and mobile) ──────────────────────

export type AlertCategory = 'Expired' | 'Today' | '7 Days' | '15 Days' | '30 Days';

export interface AlertItem {
  id: string;
  title: string;
  companyName: string;
  documentType: string;
  expiryDate: string;
  daysRemaining: number;
  entityType: 'employee' | 'document';
  entityId: string;
  category: AlertCategory;
  isRead: boolean;
}

// ─── View type (shared across layouts) ───────────────────────────────────────

export type AppView = 'dashboard' | 'companies' | 'employees' | 'alerts' | 'settings';

// ─── Alert filter/sort state ─────────────────────────────────────────────────

export type AlertSortKey = 'daysRemaining' | 'documentType' | 'companyName';

// ─── Dashboard counts ────────────────────────────────────────────────────────

export interface DashboardCounts {
  expiredCount: number;
  expiringToday: number;
  expiring7Days: number;
  expiring30Days: number;
}

// ─── Hook return type ────────────────────────────────────────────────────────

export interface AppData {
  // Raw data
  companies: Company[];
  employees: Employee[];
  documents: Document[];
  loading: boolean;
  companiesLoading: boolean;
  employeesLoading: boolean;
  docsLoading: boolean;

  // Navigation
  activeView: AppView;
  setActiveView: (view: AppView) => void;

  // Dashboard counts
  counts: DashboardCounts;

  // Alerts
  allAlerts: AlertItem[];
  filteredAlerts: AlertItem[];
  unreadAlertsCount: number;
  alertSearch: string;
  setAlertSearch: (v: string) => void;
  alertCategoryFilter: string;
  setAlertCategoryFilter: (v: string) => void;
  alertReadFilter: string;
  setAlertReadFilter: (v: string) => void;
  alertSortBy: AlertSortKey;
  setAlertSortBy: (v: AlertSortKey) => void;
  alertSortOrder: 'asc' | 'desc';
  setAlertSortOrder: (v: 'asc' | 'desc') => void;
  handleMarkRead: (id: string) => void;
  handleDeleteAlert: (id: string) => void;

  // Document form modal
  isDocFormOpen: boolean;
  setIsDocFormOpen: (v: boolean) => void;
  editingDoc: Document | undefined;
  setEditingDoc: (d: Document | undefined) => void;
  handleAddDocClick: () => void;

  // Employee details modal
  isDetailsOpen: boolean;
  setIsDetailsOpen: (v: boolean) => void;
  selectedEmployee: Employee | undefined;
  setSelectedEmployee: (e: Employee | undefined) => void;
  handleOpenEmployeeDetails: (empId: string) => void;

  // Company navigation
  companySearchQuery: string;
  handleOpenCompanyRegistry: (companyName: string) => void;

  // Global search
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;

  // Actions
  handleRecalculate: () => Promise<void>;
  handleRequestPush: () => Promise<void>;
  handleMarkAllRead: () => void;
  isRecalculating: boolean;

  // Navigation helper
  handleCardClick: (targetView: 'companies' | 'employees' | 'alerts') => void;
}

/**
 * useAppData — Shared application state and business logic hook.
 *
 * Consumed by both DesktopApp and MobileApp to avoid code duplication.
 * All data fetching, alert computation, modal state, and navigation
 * logic lives here.
 */
export function useAppData(): AppData {
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: documents = [], isLoading: docsLoading } = useDocuments();
  const recalculateDocs = useRecalculateDocuments();
  const loading = companiesLoading || employeesLoading || docsLoading;

  // ── Document form modal ────────────────────────────────────────────────────
  const [isDocFormOpen, setIsDocFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | undefined>(undefined);

  // ── Employee details modal ─────────────────────────────────────────────────
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);

  // ── Company search cross-navigation ────────────────────────────────────────
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  // ── Alert state ────────────────────────────────────────────────────────────
  const [readAlerts, setReadAlerts] = useState<string[]>([]);
  const [deletedAlerts, setDeletedAlerts] = useState<string[]>([]);
  const [alertSearch, setAlertSearch] = useState('');
  const [alertCategoryFilter, setAlertCategoryFilter] = useState('');
  const [alertReadFilter, setAlertReadFilter] = useState('Unread');
  const [alertSortBy, setAlertSortBy] = useState<AlertSortKey>('daysRemaining');
  const [alertSortOrder, setAlertSortOrder] = useState<'asc' | 'desc'>('asc');

  // ── Global search ─────────────────────────────────────────────────────────
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ── Load persisted alert state ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const read = localStorage.getItem('readAlertIds');
      const deleted = localStorage.getItem('deletedAlertIds');
      if (read) setReadAlerts(JSON.parse(read));
      if (deleted) setDeletedAlerts(JSON.parse(deleted));
    }
  }, []);

  // ── Ctrl+K global keyboard shortcut ────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Compute alerts ─────────────────────────────────────────────────────────
  const allAlerts = useMemo(() => {
    const list: AlertItem[] = [];

    // 1. Company Documents
    documents.forEach((doc) => {
      const days = getDaysRemaining(doc.expiryDate);
      let category: AlertCategory | null = null;
      if (days < 0) category = 'Expired';
      else if (days === 0) category = 'Today';
      else if (days <= 7) category = '7 Days';
      else if (days <= 15) category = '15 Days';
      else if (days <= 30) category = '30 Days';

      if (category) {
        list.push({
          id: `doc-${doc.id}`,
          title: doc.documentType,
          companyName: doc.company?.companyName || 'Corporate Account',
          documentType: doc.documentType,
          expiryDate: doc.expiryDate,
          daysRemaining: days,
          entityType: 'document',
          entityId: doc.companyId,
          category,
          isRead: readAlerts.includes(`doc-${doc.id}`),
        });
      }
    });

    // 2. Employee QID & Passport Expiries
    employees.forEach((emp) => {
      // QID Expiry
      const qidDays = getDaysRemaining(emp.qidExpiry);
      let qidCategory: AlertCategory | null = null;
      if (qidDays < 0) qidCategory = 'Expired';
      else if (qidDays === 0) qidCategory = 'Today';
      else if (qidDays <= 7) qidCategory = '7 Days';
      else if (qidDays <= 15) qidCategory = '15 Days';
      else if (qidDays <= 30) qidCategory = '30 Days';

      if (qidCategory) {
        list.push({
          id: `emp-qid-${emp.id}`,
          title: `${emp.employeeName} (QID)`,
          companyName: emp.company?.companyName || 'Sponsorship',
          documentType: 'Qatar ID (QID)',
          expiryDate: emp.qidExpiry,
          daysRemaining: qidDays,
          entityType: 'employee',
          entityId: emp.id,
          category: qidCategory,
          isRead: readAlerts.includes(`emp-qid-${emp.id}`),
        });
      }

      // Passport Expiry
      if (emp.passportExpiry) {
        const passDays = getDaysRemaining(emp.passportExpiry);
        let passCategory: AlertCategory | null = null;
        if (passDays < 0) passCategory = 'Expired';
        else if (passDays === 0) passCategory = 'Today';
        else if (passDays <= 7) passCategory = '7 Days';
        else if (passDays <= 15) passCategory = '15 Days';
        else if (passDays <= 30) passCategory = '30 Days';

        if (passCategory) {
          list.push({
            id: `emp-pass-${emp.id}`,
            title: `${emp.employeeName} (Passport)`,
            companyName: emp.company?.companyName || 'Sponsorship',
            documentType: 'Passport Document',
            expiryDate: emp.passportExpiry,
            daysRemaining: passDays,
            entityType: 'employee',
            entityId: emp.id,
            category: passCategory,
            isRead: readAlerts.includes(`emp-pass-${emp.id}`),
          });
        }
      }
    });

    // 3. Company CR & License Expiries
    companies.forEach((comp) => {
      if (comp.crExpiry) {
        const days = getDaysRemaining(comp.crExpiry);
        let category: AlertCategory | null = null;
        if (days < 0) category = 'Expired';
        else if (days === 0) category = 'Today';
        else if (days <= 7) category = '7 Days';
        else if (days <= 15) category = '15 Days';
        else if (days <= 30) category = '30 Days';

        if (category) {
          list.push({
            id: `comp-cr-${comp.id}`,
            title: `CR: ${comp.crNumber || comp.companyName}`,
            companyName: comp.companyName,
            documentType: 'Commercial Registration (CR)',
            expiryDate: comp.crExpiry,
            daysRemaining: days,
            entityType: 'document',
            entityId: comp.id,
            category,
            isRead: readAlerts.includes(`comp-cr-${comp.id}`),
          });
        }
      }

      if (comp.licenseExpiry) {
        const days = getDaysRemaining(comp.licenseExpiry);
        let category: AlertCategory | null = null;
        if (days < 0) category = 'Expired';
        else if (days === 0) category = 'Today';
        else if (days <= 7) category = '7 Days';
        else if (days <= 15) category = '15 Days';
        else if (days <= 30) category = '30 Days';

        if (category) {
          list.push({
            id: `comp-lic-${comp.id}`,
            title: `License: ${comp.licenseNumber || comp.companyName}`,
            companyName: comp.companyName,
            documentType: 'Trade License',
            expiryDate: comp.licenseExpiry,
            daysRemaining: days,
            entityType: 'document',
            entityId: comp.id,
            category,
            isRead: readAlerts.includes(`comp-lic-${comp.id}`),
          });
        }
      }
    });

    return list;
  }, [documents, employees, companies, readAlerts]);

  // ── Filter + sort alerts ───────────────────────────────────────────────────
  const filteredAlerts = useMemo(() => {
    return allAlerts
      .filter((alert) => {
        if (deletedAlerts.includes(alert.id)) return false;

        const matchSearch =
          alert.title.toLowerCase().includes(alertSearch.toLowerCase()) ||
          alert.companyName.toLowerCase().includes(alertSearch.toLowerCase()) ||
          alert.documentType.toLowerCase().includes(alertSearch.toLowerCase());

        const matchCategory = alertCategoryFilter === '' || alert.category === alertCategoryFilter;

        let matchRead = true;
        if (alertReadFilter === 'Read') matchRead = alert.isRead;
        else if (alertReadFilter === 'Unread') matchRead = !alert.isRead;

        return matchSearch && matchCategory && matchRead;
      })
      .sort((a, b) => {
        let valA: string | number = a[alertSortBy];
        let valB: string | number = b[alertSortBy];

        if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return alertSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return alertSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [allAlerts, deletedAlerts, alertSearch, alertCategoryFilter, alertReadFilter, alertSortBy, alertSortOrder]);

  const unreadAlertsCount = useMemo(
    () => allAlerts.filter((a) => !a.isRead && !deletedAlerts.includes(a.id)).length,
    [allAlerts, deletedAlerts],
  );

  // ── Dashboard counts ──────────────────────────────────────────────────────
  const counts = useMemo(() => {
    let expiredCount = 0;
    let expiringToday = 0;
    let expiring7Days = 0;
    let expiring30Days = 0;

    const checkDays = (dateStr: string) => {
      const days = getDaysRemaining(dateStr);
      if (days < 0) expiredCount++;
      else if (days === 0) expiringToday++;
      if (days >= 0 && days <= 7) expiring7Days++;
      if (days >= 0 && days <= 30) expiring30Days++;
    };

    documents.forEach((doc) => checkDays(doc.expiryDate));
    employees.forEach((emp) => {
      checkDays(emp.qidExpiry);
      if (emp.passportExpiry) checkDays(emp.passportExpiry);
    });
    companies.forEach((comp) => {
      if (comp.crExpiry) checkDays(comp.crExpiry);
      if (comp.licenseExpiry) checkDays(comp.licenseExpiry);
    });

    return { expiredCount, expiringToday, expiring7Days, expiring30Days };
  }, [documents, employees, companies]);

  // ── Callbacks ──────────────────────────────────────────────────────────────
  const handleAddDocClick = useCallback(() => {
    setEditingDoc(undefined);
    setIsDocFormOpen(true);
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setReadAlerts((prev) => {
      const updated = [...prev, id];
      localStorage.setItem('readAlertIds', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleDeleteAlert = useCallback((id: string) => {
    setDeletedAlerts((prev) => {
      const updated = [...prev, id];
      localStorage.setItem('deletedAlertIds', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleOpenEmployeeDetails = useCallback(
    (empId: string) => {
      const emp = employees.find((e) => e.id === empId);
      if (emp) {
        setSelectedEmployee(emp);
        setIsDetailsOpen(true);
      }
    },
    [employees],
  );

  const handleOpenCompanyRegistry = useCallback(
    (companyName: string) => {
      setCompanySearchQuery(companyName);
      setActiveView('companies');
    },
    [],
  );

  const handleCardClick = useCallback((targetView: 'companies' | 'employees' | 'alerts') => {
    setActiveView(targetView);
  }, []);

  const handleRecalculate = useCallback(async () => {
    try {
      await recalculateDocs.mutateAsync();
    } catch (err) {
      console.error(err);
    }
  }, [recalculateDocs]);

  const handleRequestPush = useCallback(async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      NotificationService.sendNotification('DocExpiry Alerts Enabled', {
        body: 'You will receive warnings about upcoming employee national QID and trade license expiry dates.',
      });
    }
  }, []);

  const handleMarkAllRead = useCallback(() => {
    const allIds = allAlerts.map((a) => a.id);
    setReadAlerts(allIds);
    localStorage.setItem('readAlertIds', JSON.stringify(allIds));
  }, [allAlerts]);

  return {
    companies,
    employees,
    documents,
    loading,
    companiesLoading,
    employeesLoading,
    docsLoading,
    activeView,
    setActiveView,
    counts,
    allAlerts,
    filteredAlerts,
    unreadAlertsCount,
    alertSearch,
    setAlertSearch,
    alertCategoryFilter,
    setAlertCategoryFilter,
    alertReadFilter,
    setAlertReadFilter,
    alertSortBy,
    setAlertSortBy,
    alertSortOrder,
    setAlertSortOrder,
    handleMarkRead,
    handleDeleteAlert,
    isDocFormOpen,
    setIsDocFormOpen,
    editingDoc,
    setEditingDoc,
    handleAddDocClick,
    isDetailsOpen,
    setIsDetailsOpen,
    selectedEmployee,
    setSelectedEmployee,
    handleOpenEmployeeDetails,
    companySearchQuery,
    handleOpenCompanyRegistry,
    isSearchOpen,
    setIsSearchOpen,
    handleRecalculate,
    handleRequestPush,
    handleMarkAllRead,
    isRecalculating: recalculateDocs.isPending,
    handleCardClick,
  };
}
