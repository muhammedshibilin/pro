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

    const name = typeof companyName === 'string' ? companyName.trim() : '';
    if (!name || name.length < 2) {
      return NextResponse.json(
        { statusCode: 400, message: 'Company Name is required (minimum 2 characters)' },
        { status: 400 }
      );
    }

    let parsedCrExpiry: Date | null = null;
    if (crExpiry) {
      const d = new Date(crExpiry);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ statusCode: 400, message: 'Invalid CR Expiry date' }, { status: 400 });
      }
      parsedCrExpiry = d;
    }

    let parsedLicenseExpiry: Date | null = null;
    if (licenseExpiry) {
      const d = new Date(licenseExpiry);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ statusCode: 400, message: 'Invalid License Expiry date' }, { status: 400 });
      }
      parsedLicenseExpiry = d;
    }

    const company = await prisma.company.create({
      data: {
        companyName: name,
        crNumber: crNumber ? String(crNumber).trim() : null,
        crExpiry: parsedCrExpiry,
        crPhoto: crPhoto ? String(crPhoto).trim() : null,
        licenseNumber: licenseNumber ? String(licenseNumber).trim() : null,
        licenseExpiry: parsedLicenseExpiry,
        licensePhoto: licensePhoto ? String(licensePhoto).trim() : null,
        ownerName: ownerName ? String(ownerName).trim() : '',
        phone: phone ? String(phone).trim() : '',
        email: email ? String(email).trim() : '',
        notes: notes ? String(notes).trim() : null,
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
