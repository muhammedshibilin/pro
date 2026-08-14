import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/companies/[id] — Get single company details with owner, employees, and documents
export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        owner: true,
        employees: {
          orderBy: { employeeName: 'asc' },
        },
        documents: {
          orderBy: { expiryDate: 'asc' },
        },
        _count: {
          select: {
            employees: true,
            documents: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { statusCode: 404, message: `Company with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      data: company,
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

// PATCH /api/companies/[id] — Update company
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updateData: Prisma.CompanyUpdateInput = {};
    if (body.companyName !== undefined) updateData.companyName = body.companyName;
    if (body.crNumber !== undefined) updateData.crNumber = body.crNumber || null;
    if (body.crExpiry !== undefined) updateData.crExpiry = body.crExpiry ? new Date(body.crExpiry) : null;
    if (body.crPhoto !== undefined) updateData.crPhoto = body.crPhoto || null;
    if (body.licenseNumber !== undefined) updateData.licenseNumber = body.licenseNumber || null;
    if (body.licenseExpiry !== undefined) updateData.licenseExpiry = body.licenseExpiry ? new Date(body.licenseExpiry) : null;
    if (body.licensePhoto !== undefined) updateData.licensePhoto = body.licensePhoto || null;
    if (body.computerCardNumber !== undefined) updateData.computerCardNumber = body.computerCardNumber || null;
    if (body.computerCardPhoto !== undefined) updateData.computerCardPhoto = body.computerCardPhoto || null;
    
    // Resolve Person / Owner
    if (body.ownerId !== undefined) {
      if (body.ownerId) {
        updateData.owner = { connect: { id: body.ownerId } };
        const person = await prisma.person.findUnique({ where: { id: body.ownerId } });
        if (person) {
          updateData.ownerName = person.name;
        }
      } else {
        updateData.owner = { disconnect: true };
        updateData.ownerName = body.ownerName || '';
      }
    } else if (body.ownerName !== undefined) {
      const trimmed = String(body.ownerName).trim();
      if (trimmed) {
        let person = await prisma.person.findFirst({
          where: { name: { equals: trimmed, mode: 'insensitive' } },
        });
        if (!person) {
          person = await prisma.person.create({ data: { name: trimmed } });
        }
        updateData.owner = { connect: { id: person.id } };
        updateData.ownerName = person.name;
      } else {
        updateData.owner = { disconnect: true };
        updateData.ownerName = '';
      }
    }

    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;

    const company = await prisma.company.update({
      where: { id },
      data: updateData,
      include: {
        owner: true,
        _count: {
          select: {
            employees: true,
            documents: true,
          },
        },
      },
    });

    return NextResponse.json({
      statusCode: 200,
      data: company,
      message: 'Company updated successfully',
    });
  } catch (error: unknown) {
    console.error('Error updating company:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json(
        { statusCode: 404, message: 'Company not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to update company' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] — Delete company
export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const deleted = await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({
      statusCode: 200,
      data: deleted,
      message: 'Company deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting company:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json(
        { statusCode: 404, message: 'Company not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
