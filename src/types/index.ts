import { EmployeeQidStatus, CompanyDocumentStatus } from '@/lib/status-calculator';

export type { EmployeeQidStatus, CompanyDocumentStatus };

export type EmployeeRole = 'OWNER' | 'EMPLOYEE';

export interface Person {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  qidNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  companies?: Company[];
  employees?: Employee[];
  _count?: {
    companies?: number;
    employees?: number;
  };
}

export interface Company {
  id: string;
  companyName: string;
  ownerId?: string | null;
  owner?: Person | null;
  ownerName?: string | null;
  crNumber?: string | null;
  crExpiry?: string | null;
  crPhoto?: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  licensePhoto?: string | null;
  computerCardNumber?: string | null;
  computerCardPhoto?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
    documents: number;
  };
}

export interface Employee {
  id: string;
  employeeName: string;
  role: EmployeeRole | string;           // "OWNER" | "EMPLOYEE"
  personId?: string | null;
  person?: Person | null;
  companyId: string;                     // Registered Company ID
  company?: Company;                     // Registered Company
  currentWorkingCompanyId?: string | null; // Current Working Company ID (can be different from Registered Company)
  currentWorkingCompany?: Company | null;  // Current Working Company
  phone?: string | null;                 // Local / Qatar Contact Phone
  nativeRelativePhone?: string | null;   // Native Country Relative Contact Phone
  qidNumber: string;                    // Qatar ID (QID)
  qidExpiry: string;                    // QID Expiry Date
  qidPhoto?: string | null;             // QID Document Photo URL (Cloudinary)
  passportNumber?: string | null;       // Passport Number
  passportExpiry?: string | null;       // Passport Expiry Date
  passportPhoto?: string | null;        // Passport Document Photo URL (Cloudinary)
  employeeCode?: string | null;         // Optional legacy employee code
  notes?: string | null;
  status?: string;
  qidStatus?: EmployeeQidStatus;
  createdAt: string;
  updatedAt: string;
  assignmentHistory?: CompanyAssignmentHistory[];
}

export interface CompanyAssignmentHistory {
  id: string;
  employeeId: string;
  companyId: string;
  company?: Company;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface Document {
  id: string;
  companyId: string;
  company?: Company;
  documentType: string;
  documentNumber: string;
  expiryDate: string;
  attachment?: string | null;
  notes?: string | null;
  status?: CompanyDocumentStatus | string; // calculated on-the-fly via centralized status engine
  createdAt: string;
  updatedAt: string;
}

export type CompanyDocument = Document;

export interface EmployeeStatusCounts {
  safe: number;
  month1Expired: number;
  month2Expired: number;
  month3Expired: number;
  fullyExpired: number;
}

export interface CompanyStatusCounts {
  safe: number;
  warning: number;
  danger: number;
}

export interface DashboardStats {
  totalCompanies: number;
  totalEmployees: number;
  totalDocuments: number;
  employee: EmployeeStatusCounts;
  company: CompanyStatusCounts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Future feature types — interfaces are ready; implementations are stubs.
// ─────────────────────────────────────────────────────────────────────────────

/** Supported user roles for RBAC (Role-Based Access Control). */
export type UserRole = 'admin' | 'manager' | 'viewer';

/** Supported UI/API locales. */
export type SupportedLocale = 'en' | 'ar';

/** Supported export file formats. */
export type ExportFormat = 'xlsx' | 'pdf' | 'csv';

/** Authenticated user session. */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  companyIds?: string[] | null;
  createdAt?: string;
}

/** Audit log entry for activity tracking. */
export interface AuditLog {
  id: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'UPLOAD';
  resource: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  timestamp: string;
}

/** Renewal history record for document lifecycle tracking. */
export interface RenewalHistory {
  id: string;
  documentId: string;
  previousExpiryDate: string;
  newExpiryDate: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  renewedAt: string;
  renewedBy?: string | null;
}

/** User notification preferences persisted in settings. */
export interface NotificationPreferences {
  emailAlerts: boolean;
  smsAlerts: boolean;
  whatsAppAlerts: boolean;
  pushAlerts: boolean;
  reminderDays: number[];
}

/** OCR extraction result shape. */
export interface OcrResult {
  raw: string;
  fields: Record<string, { value: string; confidence: number }>;
  confidence: number;
  language?: string;
}
