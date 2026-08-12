import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/companies — List all companies with employee & document counts
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            employees: true,
            documents: true,
          },
        },
      },
      orderBy: {
        companyName: 'asc',
      },
    });

    return NextResponse.json({
      statusCode: 200,
      data: companies,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

// POST /api/companies — Create a new company with CR, License, and Cloudinary photos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      crNumber,
      crExpiry,
      crPhoto,
      licenseNumber,
      licenseExpiry,
      licensePhoto,
      ownerName,
      phone,
      email,
      notes,
      status,
    } = body;

    if (!companyName) {
      return NextResponse.json(
        { statusCode: 400, message: 'Company Name is required' },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        companyName,
        crNumber: crNumber || null,
        crExpiry: crExpiry ? new Date(crExpiry) : null,
        crPhoto: crPhoto || null,
        licenseNumber: licenseNumber || null,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        licensePhoto: licensePhoto || null,
        ownerName: ownerName || '',
        phone: phone || '',
        email: email || '',
        notes: notes || null,
        status: status || 'Active',
      },
      include: {
        _count: {
          select: {
            employees: true,
            documents: true,
          },
        },
      },
    });

    return NextResponse.json(
      { statusCode: 201, data: company, message: 'Company created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to create company' },
      { status: 500 }
    );
  }
}
