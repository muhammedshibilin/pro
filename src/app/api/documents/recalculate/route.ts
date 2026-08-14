import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCompanyDocumentStatus } from '@/lib/status-calculator';

// POST /api/documents/recalculate — Trigger expiry re-evaluation
export async function POST() {
  try {
    const docs = await prisma.companyDocument.findMany({
      include: {
        company: true,
      },
    });

    const updated = docs.map((doc) => ({
      id: doc.id,
      documentNumber: doc.documentNumber,
      status: calculateCompanyDocumentStatus(doc.expiryDate),
    }));

    return NextResponse.json({
      statusCode: 200,
      data: {
        count: docs.length,
        items: updated,
        recalculatedAt: new Date().toISOString(),
      },
      message: 'Document statuses recalculated successfully',
    });
  } catch (error) {
    console.error('Error recalculating documents:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to recalculate documents' },
      { status: 500 }
    );
  }
}
