import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/renewal-history — Fetch renewal histories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');

    const where: Prisma.RenewalHistoryWhereInput = {};
    if (documentId) {
      where.documentId = documentId;
    }

    const renewals = await prisma.renewalHistory.findMany({
      where,
      include: {
        document: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        renewedAt: 'desc',
      },
    });

    return NextResponse.json({
      statusCode: 200,
      data: renewals,
    });
  } catch (error) {
    console.error('Error fetching renewal histories:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to fetch renewal histories' },
      { status: 500 }
    );
  }
}

// POST /api/renewal-history — Record a renewal event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, previousExpiryDate, newExpiryDate, notes, status, renewedBy } = body;

    if (!documentId || !previousExpiryDate || !newExpiryDate) {
      return NextResponse.json(
        { statusCode: 400, message: 'documentId, previousExpiryDate, and newExpiryDate are required' },
        { status: 400 }
      );
    }

    // 1. Create renewal record
    const renewal = await prisma.renewalHistory.create({
      data: {
        documentId,
        previousExpiryDate: new Date(previousExpiryDate),
        newExpiryDate: new Date(newExpiryDate),
        status: status || 'COMPLETED',
        notes: notes || null,
        renewedBy: renewedBy || 'Admin',
      },
    });

    // 2. Update parent document expiry date
    await prisma.companyDocument.update({
      where: { id: documentId },
      data: {
        expiryDate: new Date(newExpiryDate),
      },
    });

    return NextResponse.json(
      { statusCode: 201, data: renewal, message: 'Renewal logged and document updated successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error logging renewal:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to log renewal' },
      { status: 500 }
    );
  }
}
