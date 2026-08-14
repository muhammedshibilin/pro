import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/employees/[id] — Fetch single employee with Registered Company, Current Working Company, and Assignment History
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
        currentWorkingCompany: true,
        person: true,
        assignmentHistory: {
          include: {
            company: true,
          },
          orderBy: { startDate: 'desc' },
        },
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

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json({ statusCode: 404, message: 'Employee not found' }, { status: 404 });
    }

    const updateData: Prisma.EmployeeUpdateInput = {};
    if (body.employeeName !== undefined) {
      const name = typeof body.employeeName === 'string' ? body.employeeName.trim() : '';
      if (!name || name.length < 2) {
        return NextResponse.json(
          { statusCode: 400, message: 'Employee name is required (minimum 2 characters)' },
          { status: 400 }
        );
      }
      updateData.employeeName = name;
    }

    if (body.role !== undefined) {
      updateData.role = String(body.role).toUpperCase() === 'OWNER' ? 'OWNER' : 'EMPLOYEE';
    }

    if (body.companyId !== undefined) {
      const comp = await prisma.company.findUnique({ where: { id: body.companyId } });
      if (!comp) {
        return NextResponse.json({ statusCode: 400, message: 'Selected registered company does not exist' }, { status: 400 });
      }
      updateData.company = { connect: { id: body.companyId } };
    }

    if (body.currentWorkingCompanyId !== undefined) {
      const newWorkingId = body.currentWorkingCompanyId ? String(body.currentWorkingCompanyId).trim() : null;
      if (newWorkingId) {
        const comp = await prisma.company.findUnique({ where: { id: newWorkingId } });
        if (!comp) {
          return NextResponse.json({ statusCode: 400, message: 'Selected working company does not exist' }, { status: 400 });
        }
        updateData.currentWorkingCompany = { connect: { id: newWorkingId } };

        // If changed, add an assignment history record
        if (existingEmployee.currentWorkingCompanyId !== newWorkingId) {
          await prisma.companyAssignmentHistory.create({
            data: {
              employeeId: id,
              companyId: newWorkingId,
              startDate: new Date(),
              notes: 'Working company updated',
            },
          });
        }
      } else {
        updateData.currentWorkingCompany = { disconnect: true };
      }
    }

    if (body.phone !== undefined) updateData.phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    if (body.nativeRelativePhone !== undefined) updateData.nativeRelativePhone = typeof body.nativeRelativePhone === 'string' ? body.nativeRelativePhone.trim() : '';

    if (body.qidNumber !== undefined) {
      const qid = String(body.qidNumber).trim();
      if (!qid || qid.length < 5) {
        return NextResponse.json({ statusCode: 400, message: 'Qatar ID (QID) must be at least 5 digits' }, { status: 400 });
      }
      const existingQid = await prisma.employee.findFirst({
        where: {
          qidNumber: qid,
          id: { not: id },
        },
      });
      if (existingQid) {
        return NextResponse.json(
          { statusCode: 400, message: `An employee with QID number "${qid}" already exists (${existingQid.employeeName}).` },
          { status: 400 }
        );
      }
      updateData.qidNumber = qid;
    }

    if (body.qidExpiry !== undefined) {
      const parsed = new Date(body.qidExpiry);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ statusCode: 400, message: 'A valid QID expiry date is required' }, { status: 400 });
      }
      updateData.qidExpiry = parsed;
    }

    if (body.passportNumber !== undefined) {
      const passport = body.passportNumber ? String(body.passportNumber).trim() : null;
      if (passport) {
        const existingPassport = await prisma.employee.findFirst({
          where: {
            passportNumber: { equals: passport, mode: 'insensitive' },
            id: { not: id },
          },
        });
        if (existingPassport) {
          return NextResponse.json(
            { statusCode: 400, message: `An employee with Passport number "${passport}" already exists (${existingPassport.employeeName}).` },
            { status: 400 }
          );
        }
      }
      updateData.passportNumber = passport;
    }

    if (body.passportExpiry !== undefined) {
      let parsedPassport: Date | null = null;
      if (body.passportExpiry) {
        const d = new Date(body.passportExpiry);
        if (isNaN(d.getTime())) {
          return NextResponse.json({ statusCode: 400, message: 'Invalid Passport expiry date' }, { status: 400 });
        }
        parsedPassport = d;
      }
      updateData.passportExpiry = parsedPassport;
    }

    if (body.qidPhoto !== undefined) updateData.qidPhoto = body.qidPhoto || null;
    if (body.passportPhoto !== undefined) updateData.passportPhoto = body.passportPhoto || null;
    if (body.notes !== undefined) updateData.notes = body.notes ? String(body.notes).trim() : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.employeeCode !== undefined) updateData.employeeCode = body.employeeCode;

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        currentWorkingCompany: true,
        person: true,
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
