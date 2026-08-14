'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDocuments, useRecalculateDocuments } from '@/hooks/use-documents';
import { useEmployees } from '@/hooks/use-employees';
import { useCompanies } from '@/hooks/use-companies';
import { getDaysRemaining } from '@/lib/utils';
import { 
  calculateEmployeeQidStatus, 
  calculateCompanyDocumentStatus 
} from '@/lib/status-calculator';
import { 
  Document, 
  Employee, 
  Company, 
  EmployeeStatusCounts, 
  CompanyStatusCounts 
} from '@/types';
import { NotificationService } from '@/lib/notification-service';

// ─── Alert Item type (shared across desktop and mobile) ──────────────────────

export type AlertCategory = 
  | '1st Month Expired' 
  | '2nd Month Expired' 
  | '3rd Month Expired' 
  | 'Fully Expired'
  | 'Danger'
  | 'Warning';

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
  statusCode: string;
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

  // Status counts (Source of Truth)
  employeeCounts: EmployeeStatusCounts;
  companyCounts: CompanyStatusCounts;
  counts: DashboardCounts;

  // Status Filtering
  employeeStatusFilter: string;
  setEmployeeStatusFilter: (v: string) => void;
  companyStatusFilter: string;
  setCompanyStatusFilter: (v: string) => void;

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

export function useAppData(): AppData {
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: rawCompanies = [], isLoading: companiesLoading } = useCompanies();
  const { data: rawEmployees = [], isLoading: employeesLoading } = useEmployees();
  const { data: rawDocuments = [], isLoading: docsLoading } = useDocuments();
  const recalculateDocs = useRecalculateDocuments();
  const loading = companiesLoading || employeesLoading || docsLoading;

  // Augment entities with dynamic status calculations from centralized calculator
  const employees: Employee[] = useMemo(() => {
    return rawEmployees.map((emp) => ({
      ...emp,
      qidStatus: calculateEmployeeQidStatus(emp.qidExpiry),
    }));
  }, [rawEmployees]);

  const documents: Document[] = useMemo(() => {
    return rawDocuments.map((doc) => ({
      ...doc,
      status: calculateCompanyDocumentStatus(doc.expiryDate),
    }));
  }, [rawDocuments]);

  const companies: Company[] = rawCompanies;

  // ── Status Filters ─────────────────────────────────────────────────────────
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<string>('ALL');
  const [companyStatusFilter, setCompanyStatusFilter] = useState<string>('ALL');

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

  // ── Status Counts Calculations (Source of Truth) ───────────────────────────
  const employeeCounts: EmployeeStatusCounts = useMemo(() => {
    let safe = 0;
    let month1Expired = 0;
    let month2Expired = 0;
    let month3Expired = 0;
    let fullyExpired = 0;

    employees.forEach((emp) => {
      const status = calculateEmployeeQidStatus(emp.qidExpiry);
      if (status === 'SAFE') safe++;
      else if (status === 'MONTH_1_EXPIRED') month1Expired++;
      else if (status === 'MONTH_2_EXPIRED') month2Expired++;
      else if (status === 'MONTH_3_EXPIRED') month3Expired++;
      else if (status === 'FULLY_EXPIRED') fullyExpired++;
    });

    return { safe, month1Expired, month2Expired, month3Expired, fullyExpired };
  }, [employees]);

  const companyCounts: CompanyStatusCounts = useMemo(() => {
    let safe = 0;
    let warning = 0;
    let danger = 0;

    // Evaluate company documents (CR, License, Computer Card, uploaded docs)
    documents.forEach((doc) => {
      const s = calculateCompanyDocumentStatus(doc.expiryDate);
      if (s === 'SAFE') safe++;
      else if (s === 'WARNING') warning++;
      else if (s === 'DANGER') danger++;
    });

    companies.forEach((comp) => {
      if (comp.crExpiry) {
        const s = calculateCompanyDocumentStatus(comp.crExpiry);
        if (s === 'SAFE') safe++;
        else if (s === 'WARNING') warning++;
        else if (s === 'DANGER') danger++;
      }
      if (comp.licenseExpiry) {
        const s = calculateCompanyDocumentStatus(comp.licenseExpiry);
        if (s === 'SAFE') safe++;
        else if (s === 'WARNING') warning++;
        else if (s === 'DANGER') danger++;
      }
      // Computer Card inherits licenseExpiry automatically
      if (comp.computerCardNumber && comp.licenseExpiry) {
        const s = calculateCompanyDocumentStatus(comp.licenseExpiry);
        if (s === 'SAFE') safe++;
        else if (s === 'WARNING') warning++;
        else if (s === 'DANGER') danger++;
      }
    });

    return { safe, warning, danger };
  }, [documents, companies]);

  // Backward-compatible counts overview
  const counts: DashboardCounts = useMemo(() => {
    const expiredCount = employeeCounts.month1Expired + employeeCounts.month2Expired + employeeCounts.month3Expired + employeeCounts.fullyExpired + companyCounts.danger;
    let expiringToday = 0;
    let expiring7Days = 0;
    const expiring30Days = companyCounts.warning;

    const checkDays = (dateStr: string) => {
      const days = getDaysRemaining(dateStr);
      if (days === 0) expiringToday++;
      if (days > 0 && days <= 7) expiring7Days++;
    };

    documents.forEach((doc) => checkDays(doc.expiryDate));
    employees.forEach((emp) => {
      checkDays(emp.qidExpiry);
      if (emp.passportExpiry) checkDays(emp.passportExpiry);
    });

    return { expiredCount, expiringToday, expiring7Days, expiring30Days };
  }, [employeeCounts, companyCounts, documents, employees]);

  // ── Compute alerts ─────────────────────────────────────────────────────────
  const allAlerts = useMemo(() => {
    const list: AlertItem[] = [];

    // 1. Employee QID Expiry alerts (Only non-SAFE items generate compliance alerts)
    employees.forEach((emp) => {
      const status = calculateEmployeeQidStatus(emp.qidExpiry);
      const days = getDaysRemaining(emp.qidExpiry);

      if (status !== 'SAFE') {
        let category: AlertCategory = '1st Month Expired';
        if (status === 'MONTH_1_EXPIRED') category = '1st Month Expired';
        else if (status === 'MONTH_2_EXPIRED') category = '2nd Month Expired';
        else if (status === 'MONTH_3_EXPIRED') category = '3rd Month Expired';
        else if (status === 'FULLY_EXPIRED') category = 'Fully Expired';

        list.push({
          id: `emp-qid-${emp.id}`,
          title: `${emp.employeeName} (QID)`,
          companyName: emp.company?.companyName || 'Corporate Sponsorship',
          documentType: 'Qatar ID (QID)',
          expiryDate: emp.qidExpiry,
          daysRemaining: days,
          entityType: 'employee',
          entityId: emp.id,
          category,
          statusCode: status,
          isRead: readAlerts.includes(`emp-qid-${emp.id}`),
        });
      }
    });

    // 2. Company CR, License, & Computer Card Expiry alerts
    companies.forEach((comp) => {
      if (comp.crExpiry) {
        const status = calculateCompanyDocumentStatus(comp.crExpiry);
        const days = getDaysRemaining(comp.crExpiry);
        if (status !== 'SAFE') {
          list.push({
            id: `comp-cr-${comp.id}`,
            title: `CR: ${comp.crNumber || comp.companyName}`,
            companyName: comp.companyName,
            documentType: 'Commercial Registration (CR)',
            expiryDate: comp.crExpiry,
            daysRemaining: days,
            entityType: 'document',
            entityId: comp.id,
            category: status === 'DANGER' ? 'Danger' : 'Warning',
            statusCode: status,
            isRead: readAlerts.includes(`comp-cr-${comp.id}`),
          });
        }
      }

      if (comp.licenseExpiry) {
        const status = calculateCompanyDocumentStatus(comp.licenseExpiry);
        const days = getDaysRemaining(comp.licenseExpiry);
        if (status !== 'SAFE') {
          list.push({
            id: `comp-lic-${comp.id}`,
            title: `License: ${comp.licenseNumber || comp.companyName}`,
            companyName: comp.companyName,
            documentType: 'Trade License',
            expiryDate: comp.licenseExpiry,
            daysRemaining: days,
            entityType: 'document',
            entityId: comp.id,
            category: status === 'DANGER' ? 'Danger' : 'Warning',
            statusCode: status,
            isRead: readAlerts.includes(`comp-lic-${comp.id}`),
          });
        }
      }

      if (comp.computerCardNumber && comp.licenseExpiry) {
        const status = calculateCompanyDocumentStatus(comp.licenseExpiry);
        const days = getDaysRemaining(comp.licenseExpiry);
        if (status !== 'SAFE') {
          list.push({
            id: `comp-cc-${comp.id}`,
            title: `Computer Card: ${comp.computerCardNumber || comp.companyName}`,
            companyName: comp.companyName,
            documentType: 'Computer Card (Inherits License Expiry)',
            expiryDate: comp.licenseExpiry,
            daysRemaining: days,
            entityType: 'document',
            entityId: comp.id,
            category: status === 'DANGER' ? 'Danger' : 'Warning',
            statusCode: status,
            isRead: readAlerts.includes(`comp-cc-${comp.id}`),
          });
        }
      }
    });

    // 3. Uploaded Company Documents alerts
    documents.forEach((doc) => {
      const status = calculateCompanyDocumentStatus(doc.expiryDate);
      const days = getDaysRemaining(doc.expiryDate);
      if (status !== 'SAFE') {
        list.push({
          id: `doc-${doc.id}`,
          title: doc.documentType,
          companyName: doc.company?.companyName || 'Corporate Account',
          documentType: doc.documentType,
          expiryDate: doc.expiryDate,
          daysRemaining: days,
          entityType: 'document',
          entityId: doc.companyId,
          category: status === 'DANGER' ? 'Danger' : 'Warning',
          statusCode: status,
          isRead: readAlerts.includes(`doc-${doc.id}`),
        });
      }
    });

    return list;
  }, [employees, companies, documents, readAlerts]);

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
    [allAlerts, deletedAlerts]
  );

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

  const handleMarkAllRead = useCallback(() => {
    const allIds = allAlerts.map((a) => a.id);
    setReadAlerts(allIds);
    localStorage.setItem('readAlertIds', JSON.stringify(allIds));
  }, [allAlerts]);

  const handleOpenEmployeeDetails = useCallback((empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setSelectedEmployee(emp);
      setIsDetailsOpen(true);
    }
  }, [employees]);

  const handleOpenCompanyRegistry = useCallback((companyName: string) => {
    setCompanySearchQuery(companyName);
    setActiveView('companies');
  }, []);

  const handleCardClick = useCallback((targetView: 'companies' | 'employees' | 'alerts') => {
    setActiveView(targetView);
  }, []);

  const handleRecalculate = useCallback(async () => {
    await recalculateDocs.mutateAsync();
  }, [recalculateDocs]);

  const handleRequestPush = useCallback(async () => {
    await NotificationService.requestPermission();
  }, []);

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

    employeeCounts,
    companyCounts,
    counts,

    employeeStatusFilter,
    setEmployeeStatusFilter,
    companyStatusFilter,
    setCompanyStatusFilter,

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
