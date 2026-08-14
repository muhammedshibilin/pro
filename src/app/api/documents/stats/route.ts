import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCompanyDocumentStatus, calculateEmployeeQidStatus } from '@/lib/status-calculator';

// GET /api/documents/stats — Aggregate stats based on centralized calendar-month status engine
export async function GET() {
  try {
    const [docs, employees, companies] = await Promise.all([
      prisma.companyDocument.findMany(),
      prisma.employee.findMany(),
      prisma.company.findMany(),
    ]);

    // 1. Company Documents Stats (SAFE, WARNING, DANGER)
    let companySafe = 0;
    let companyWarning = 0;
    let companyDanger = 0;

    docs.forEach((doc) => {
      const status = calculateCompanyDocumentStatus(doc.expiryDate);
      if (status === 'SAFE') companySafe++;
      else if (status === 'WARNING') companyWarning++;
      else if (status === 'DANGER') companyDanger++;
    });

    companies.forEach((comp) => {
      if (comp.crExpiry) {
        const s = calculateCompanyDocumentStatus(comp.crExpiry);
        if (s === 'SAFE') companySafe++;
        else if (s === 'WARNING') companyWarning++;
        else if (s === 'DANGER') companyDanger++;
      }
      if (comp.licenseExpiry) {
        const s = calculateCompanyDocumentStatus(comp.licenseExpiry);
        if (s === 'SAFE') companySafe++;
        else if (s === 'WARNING') companyWarning++;
        else if (s === 'DANGER') companyDanger++;
      }
      // Computer Card inherits licenseExpiry automatically
      if (comp.computerCardNumber && comp.licenseExpiry) {
        const s = calculateCompanyDocumentStatus(comp.licenseExpiry);
        if (s === 'SAFE') companySafe++;
        else if (s === 'WARNING') companyWarning++;
        else if (s === 'DANGER') companyDanger++;
      }
    });

    // 2. Employee QID Stats (SAFE, MONTH_1_EXPIRED, MONTH_2_EXPIRED, MONTH_3_EXPIRED, FULLY_EXPIRED)
    let empSafe = 0;
    let empMonth1 = 0;
    let empMonth2 = 0;
    let empMonth3 = 0;
    let empFullyExpired = 0;

    employees.forEach((emp) => {
      const status = calculateEmployeeQidStatus(emp.qidExpiry);
      if (status === 'SAFE') empSafe++;
      else if (status === 'MONTH_1_EXPIRED') empMonth1++;
      else if (status === 'MONTH_2_EXPIRED') empMonth2++;
      else if (status === 'MONTH_3_EXPIRED') empMonth3++;
      else if (status === 'FULLY_EXPIRED') empFullyExpired++;
    });

    return NextResponse.json({
      statusCode: 200,
      data: {
        totalCompanies: companies.length,
        totalEmployees: employees.length,
        totalDocuments: docs.length,
        company: {
          safe: companySafe,
          warning: companyWarning,
          danger: companyDanger,
        },
        employee: {
          safe: empSafe,
          month1Expired: empMonth1,
          month2Expired: empMonth2,
          month3Expired: empMonth3,
          fullyExpired: empFullyExpired,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching aggregate stats:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to fetch aggregate stats' },
      { status: 500 }
    );
  }
}
