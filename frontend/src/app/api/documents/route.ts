import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateExpiryStatus } from '@/lib/utils';

// GET /api/documents — List documents with dynamic status calculation
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const statusFilter = searchParams.get('status');
    const typeFilter = searchParams.get('type');

    const where: Prisma.CompanyDocumentWhereInput = {};
    if (companyId) {
      where.companyId = companyId;
    }
    if (typeFilter) {
      where.documentType = typeFilter;
    }

    const docs = await prisma.companyDocument.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    const mappedDocs = docs.map((doc) => ({
      ...doc,
      status: calculateExpiryStatus(doc.expiryDate),
    }));

    const filteredDocs = statusFilter
      ? mappedDocs.filter((d) => d.status.toLowerCase() === statusFilter.toLowerCase())
      : mappedDocs;

    return NextResponse.json({
      statusCode: 200,
      data: filteredDocs,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents — Create company document
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, documentType, documentNumber, expiryDate, attachment, notes } = body;

    if (!companyId || !documentType || !documentNumber || !expiryDate) {
      return NextResponse.json(
        { statusCode: 400, message: 'companyId, documentType, documentNumber, and expiryDate are required' },
        { status: 400 }
      );
    }

    const doc = await prisma.companyDocument.create({
      data: {
        companyId,
        documentType,
        documentNumber,
        expiryDate: new Date(expiryDate),
        attachment: attachment || null,
        notes: notes || null,
      },
      include: {
        company: true,
      },
    });

    const result = {
      ...doc,
      status: calculateExpiryStatus(doc.expiryDate),
    };

    return NextResponse.json(
      { statusCode: 201, data: result, message: 'Document created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to create document' },
      { status: 500 }
    );
  }
}
