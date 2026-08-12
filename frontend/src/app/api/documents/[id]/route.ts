import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateExpiryStatus } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id] — Fetch single document
export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const doc = await prisma.companyDocument.findUnique({
      where: { id },
      include: {
        company: true,
        renewals: {
          orderBy: { renewedAt: 'desc' },
        },
      },
    });

    if (!doc) {
      return NextResponse.json(
        { statusCode: 404, message: `Document with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      data: {
        ...doc,
        status: calculateExpiryStatus(doc.expiryDate),
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PATCH /api/documents/[id] — Update document
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updateData: Prisma.CompanyDocumentUpdateInput = {};
    if (body.companyId !== undefined) updateData.company = { connect: { id: body.companyId } };
    if (body.documentType !== undefined) updateData.documentType = body.documentType;
    if (body.documentNumber !== undefined) updateData.documentNumber = body.documentNumber;
    if (body.expiryDate !== undefined) updateData.expiryDate = new Date(body.expiryDate);
    if (body.attachment !== undefined) updateData.attachment = body.attachment;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const doc = await prisma.companyDocument.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
      },
    });

    return NextResponse.json({
      statusCode: 200,
      data: {
        ...doc,
        status: calculateExpiryStatus(doc.expiryDate),
      },
      message: 'Document updated successfully',
    });
  } catch (error: unknown) {
    console.error('Error updating document:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json(
        { statusCode: 404, message: 'Document not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] — Delete document
export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const deleted = await prisma.companyDocument.delete({
      where: { id },
    });

    return NextResponse.json({
      statusCode: 200,
      data: deleted,
      message: 'Document deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting document:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json(
        { statusCode: 404, message: 'Document not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
