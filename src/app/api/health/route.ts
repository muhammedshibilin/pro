import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [companiesCount, employeesCount, docsCount] = await Promise.all([
      prisma.company.count(),
      prisma.employee.count(),
      prisma.companyDocument.count(),
    ]);

    return NextResponse.json({
      status: 'healthy',
      runtime: 'Next.js Full Stack App Router',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        counts: {
          companies: companiesCount,
          employees: employeesCount,
          documents: docsCount,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error';
    return NextResponse.json(
      {
        status: 'degraded',
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
