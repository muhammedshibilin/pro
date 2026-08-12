import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateExpiryStatus } from '@/lib/utils';

// POST /api/export — Generate CSV or JSON export
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type = 'documents', format = 'csv', companyId } = body;

    if (type === 'employees') {
      const where: Prisma.EmployeeWhereInput = {};
      if (companyId) {
        where.companyId = companyId;
      }

      const employees = await prisma.employee.findMany({
        where,
        include: { company: true },
        orderBy: { employeeName: 'asc' },
      });

      if (format === 'csv') {
        const header = 'Employee Name,Company,Local Contact,Native Relative Contact,QID Number,QID Expiry,Passport Number,Passport Expiry,Status,Notes\n';
        const rows = employees
          .map((e) =>
            [
              `"${e.employeeName}"`,
              `"${e.company?.companyName || ''}"`,
              `"${e.phone || ''}"`,
              `"${e.nativeRelativePhone || ''}"`,
              `"${e.qidNumber}"`,
              `"${new Date(e.qidExpiry).toISOString().split('T')[0]}"`,
              `"${e.passportNumber || ''}"`,
              `"${e.passportExpiry ? new Date(e.passportExpiry).toISOString().split('T')[0] : ''}"`,
              `"${e.status}"`,
              `"${(e.notes || '').replace(/"/g, '""')}"`,
            ].join(',')
          )
          .join('\n');

        return new NextResponse(header + rows, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="employees-export-${Date.now()}.csv"`,
          },
        });
      }

      return NextResponse.json({
        statusCode: 200,
        data: employees,
      });
    }

    // Default: documents
    const docWhere: Prisma.CompanyDocumentWhereInput = {};
    if (companyId) {
      docWhere.companyId = companyId;
    }

    const documents = await prisma.companyDocument.findMany({
      where: docWhere,
      include: { company: true },
      orderBy: { expiryDate: 'asc' },
    });

    const mapped = documents.map((d) => ({
      ...d,
      status: calculateExpiryStatus(d.expiryDate),
    }));

    if (format === 'csv') {
      const header = 'Document Type,Document Number,Company,Expiry Date,Status,Attachment,Notes\n';
      const rows = mapped
        .map((d) =>
          [
            `"${d.documentType}"`,
            `"${d.documentNumber}"`,
            `"${d.company?.companyName || ''}"`,
            `"${new Date(d.expiryDate).toISOString().split('T')[0]}"`,
            `"${d.status}"`,
            `"${d.attachment || ''}"`,
            `"${(d.notes || '').replace(/"/g, '""')}"`,
          ].join(',')
        )
        .join('\n');

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="documents-export-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      statusCode: 200,
      data: mapped,
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to generate export' },
      { status: 500 }
    );
  }
}
