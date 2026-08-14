import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/employees/[id] — Fetch single employee
export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { statusCode: 404, message: `Employee with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      data: employee,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PATCH /api/employees/[id] — Update employee
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updateData: Prisma.EmployeeUpdateInput = {};
    if (body.employeeName !== undefined) updateData.employeeName = body.employeeName;
    if (body.companyId !== undefined) updateData.company = { connect: { id: body.companyId } };
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.nativeRelativePhone !== undefined) updateData.nativeRelativePhone = body.nativeRelativePhone;
    if (body.qidNumber !== undefined) updateData.qidNumber = body.qidNumber;
    if (body.qidExpiry !== undefined) updateData.qidExpiry = new Date(body.qidExpiry);
    if (body.qidPhoto !== undefined) updateData.qidPhoto = body.qidPhoto || null;
    if (body.passportNumber !== undefined) updateData.passportNumber = body.passportNumber || null;
    if (body.passportExpiry !== undefined) updateData.passportExpiry = body.passportExpiry ? new Date(body.passportExpiry) : null;
    if (body.passportPhoto !== undefined) updateData.passportPhoto = body.passportPhoto || null;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.employeeCode !== undefined) updateData.employeeCode = body.employeeCode;

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
      },
    });

    return NextResponse.json({
      statusCode: 200,
      data: employee,
      message: 'Employee updated successfully',
    });
  } catch (error: unknown) {
    console.error('Error updating employee:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json(
        { statusCode: 404, message: 'Employee not found' },
        { status: 404 }
      );
    }
    if (err.code === 'P2002') {
      return NextResponse.json(
        { statusCode: 400, message: 'An employee with this QID number already exists.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] — Delete employee
export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const deleted = await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({
      statusCode: 200,
      data: deleted,
      message: 'Employee deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting employee:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json(
        { statusCode: 404, message: 'Employee not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
