import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateExpiryStatus } from '@/lib/utils';

// GET /api/search?q=... — Global multi-entity search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query) {
      return NextResponse.json({
        statusCode: 200,
        data: { companies: [], employees: [], documents: [] },
      });
    }

    const [companies, employees, rawDocuments] = await Promise.all([
      prisma.company.findMany({
        where: {
          OR: [
            { companyName: { contains: query } },
            { crNumber: { contains: query } },
            { licenseNumber: { contains: query } },
            { ownerName: { contains: query } },
            { email: { contains: query } },
            { phone: { contains: query } },
          ],
        },
        include: {
          _count: {
            select: {
              employees: true,
              documents: true,
            },
          },
        },
        take: 15,
      }),
      prisma.employee.findMany({
        where: {
          OR: [
            { employeeName: { contains: query } },
            { qidNumber: { contains: query } },
            { passportNumber: { contains: query } },
            { phone: { contains: query } },
            { nativeRelativePhone: { contains: query } },
            { employeeCode: { contains: query } },
          ],
        },
        include: {
          company: true,
        },
        take: 15,
      }),
      prisma.companyDocument.findMany({
        where: {
          OR: [
            { documentType: { contains: query } },
            { documentNumber: { contains: query } },
            { notes: { contains: query } },
          ],
        },
        include: {
          company: true,
        },
        take: 15,
      }),
    ]);

    const documents = rawDocuments.map((doc) => ({
      ...doc,
      status: calculateExpiryStatus(doc.expiryDate),
    }));

    return NextResponse.json({
      statusCode: 200,
      data: {
        companies,
        employees,
        documents,
      },
    });
  } catch (error) {
    console.error('Error during global search:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Search query failed' },
      { status: 500 }
    );
  }
}
