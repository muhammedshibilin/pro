import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCompanyDocumentStatus, calculateEmployeeQidStatus } from '@/lib/status-calculator';

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

    const [companies, rawEmployees, rawDocuments] = await Promise.all([
      prisma.company.findMany({
        where: {
          OR: [
            { companyName: { contains: query, mode: 'insensitive' } },
            { crNumber: { contains: query, mode: 'insensitive' } },
            { licenseNumber: { contains: query, mode: 'insensitive' } },
            { computerCardNumber: { contains: query, mode: 'insensitive' } },
            { ownerName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          owner: true,
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
            { employeeName: { contains: query, mode: 'insensitive' } },
            { qidNumber: { contains: query, mode: 'insensitive' } },
            { passportNumber: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { nativeRelativePhone: { contains: query, mode: 'insensitive' } },
            { employeeCode: { contains: query, mode: 'insensitive' } },
            { role: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          company: true,
          currentWorkingCompany: true,
        },
        take: 15,
      }),
      prisma.companyDocument.findMany({
        where: {
          OR: [
            { documentType: { contains: query, mode: 'insensitive' } },
            { documentNumber: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          company: true,
        },
        take: 15,
      }),
    ]);

    const employees = rawEmployees.map((emp) => ({
      ...emp,
      qidStatus: calculateEmployeeQidStatus(emp.qidExpiry),
    }));

    const documents = rawDocuments.map((doc) => ({
      ...doc,
      status: calculateCompanyDocumentStatus(doc.expiryDate),
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
      { statusCode: 500, message: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
