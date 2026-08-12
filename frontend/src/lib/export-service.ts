/**
 * Frontend export service abstraction.
 *
 * Current state: All methods throw NotImplementedError.
 *
 * To implement Excel export:
 *   npm install xlsx
 *   Use XLSX.utils.json_to_sheet() + XLSX.writeFile()
 *
 * To implement PDF export:
 *   Option A (client-side): npm install jspdf jspdf-autotable
 *   Option B (server-side): Call GET /api/export/employees/pdf — backend uses Puppeteer
 *
 * Extension point:
 *   All list pages (company-list, employee-list, document-list) should import
 *   exportService and call the relevant method on an "Export" button click.
 *   No page changes needed when the implementation is swapped.
 */

import { ExportFormat } from '@/types';

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotImplementedError';
  }
}

export interface IFrontendExportService {
  exportToExcel<T extends object>(data: T[], filename: string): Promise<void>;
  exportToPdf<T extends object>(data: T[], filename: string, title: string): Promise<void>;
  exportToCsv<T extends object>(data: T[], filename: string): Promise<void>;
  exportViaApi(resource: string, format: ExportFormat): Promise<void>;
}

class ExportServiceImpl implements IFrontendExportService {
  /**
   * @future Install xlsx: npm install xlsx
   * import * as XLSX from 'xlsx';
   * const ws = XLSX.utils.json_to_sheet(data);
   * const wb = XLSX.utils.book_new();
   * XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
   * XLSX.writeFile(wb, filename + '.xlsx');
   */
  async exportToExcel<T extends object>(_data: T[], _filename: string): Promise<void> {
    throw new NotImplementedError(
      'Excel export not implemented. Install xlsx and implement ExportService.exportToExcel.',
    );
  }

  /**
   * @future Install jspdf + jspdf-autotable: npm install jspdf jspdf-autotable
   * import jsPDF from 'jspdf';
   * import autoTable from 'jspdf-autotable';
   * const doc = new jsPDF(); autoTable(doc, { head: [cols], body: rows }); doc.save(filename);
   *
   * Or call the backend: GET /api/export/employees/pdf (server-side Puppeteer)
   */
  async exportToPdf<T extends object>(_data: T[], _filename: string, _title: string): Promise<void> {
    throw new NotImplementedError(
      'PDF export not implemented. Install jspdf or use server-side /api/export endpoint.',
    );
  }

  async exportToCsv<T extends object>(_data: T[], _filename: string): Promise<void> {
    throw new NotImplementedError('CSV export not implemented.');
  }

  /**
   * Trigger a server-side export via the /api/export endpoint.
   * The backend ExportService generates the file and streams it back.
   */
  async exportViaApi(resource: string, format: ExportFormat): Promise<void> {
    const url = `/api/export/${resource}/${format}`;
    // @future: fetch(url) and trigger file download via <a> blob URL
    throw new NotImplementedError(
      `Server-side export via ${url} not implemented. Implement backend ExportService first.`,
    );
  }
}

/** Singleton export service instance. */
export const exportService: IFrontendExportService = new ExportServiceImpl();
