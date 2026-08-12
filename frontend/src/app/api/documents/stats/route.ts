import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateExpiryStatus } from '@/lib/utils';

// GET /api/documents/stats — Aggregate stats
export async function GET() {
  try {
    const docs = await prisma.companyDocument.findMany();

    let active = 0;
    let expired = 0;
    let expiringSoon = 0;

    docs.forEach((doc) => {
      const status = calculateExpiryStatus(doc.expiryDate);
      if (status === 'Active') active++;
      else if (status === 'Expired') expired++;
      else if (status === 'Expiring Soon') expiringSoon++;
    });

    return NextResponse.json({
      statusCode: 200,
      data: {
        total: docs.length,
        active,
        expired,
        expiringSoon,
      },
    });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to fetch document stats' },
      { status: 500 }
    );
  }
}
