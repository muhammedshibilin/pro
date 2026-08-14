import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateCompanyDocumentStatus } from '@/lib/status-calculator';

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
      status: calculateCompanyDocumentStatus(doc.expiryDate),
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
    const docNum = typeof documentNumber === 'string' ? documentNumber.trim() : '';
    const docType = typeof documentType === 'string' ? documentType.trim() : '';

    if (!companyId) {
      return NextResponse.json(
        { statusCode: 400, message: 'Please select a valid company' },
        { status: 400 }
      );
    }

    if (!docType) {
      return NextResponse.json(
        { statusCode: 400, message: 'Document type is required' },
        { status: 400 }
      );
    }

    if (!docNum || docNum.length < 2) {
      return NextResponse.json(
        { statusCode: 400, message: 'Document number is required (minimum 2 characters)' },
        { status: 400 }
      );
    }

    const parsedExpiry = new Date(expiryDate);
    if (isNaN(parsedExpiry.getTime())) {
      return NextResponse.json(
        { statusCode: 400, message: 'A valid document expiry date is required' },
        { status: 400 }
      );
    }

    // Verify company exists
    const companyExists = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!companyExists) {
      return NextResponse.json(
        { statusCode: 400, message: 'Selected company does not exist' },
        { status: 400 }
      );
    }

    const doc = await prisma.companyDocument.create({
      data: {
        companyId,
        documentType: docType,
        documentNumber: docNum,
        expiryDate: parsedExpiry,
        attachment: attachment ? String(attachment).trim() : null,
        notes: notes ? String(notes).trim() : null,
      },
      include: {
        company: true,
      },
    });

    const result = {
      ...doc,
      status: calculateCompanyDocumentStatus(doc.expiryDate),
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
