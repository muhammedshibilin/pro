import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

function generateEmployeeCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'EMP-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/employees — List all employees (optionally filtered by companyId)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    const where: Prisma.EmployeeWhereInput = {};
    if (companyId) {
      where.companyId = companyId;
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: {
        employeeName: 'asc',
      },
    });

    return NextResponse.json({
      statusCode: 200,
      data: employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST /api/employees — Create employee
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employeeName,
      companyId,
      phone,
      nativeRelativePhone,
      qidNumber,
      qidExpiry,
      qidPhoto,
      passportNumber,
      passportExpiry,
      passportPhoto,
      notes,
      status,
      employeeCode,
    } = body;

    if (!employeeName || !companyId || !qidNumber || !qidExpiry) {
      return NextResponse.json(
        { statusCode: 400, message: 'employeeName, companyId, qidNumber, and qidExpiry are required' },
        { status: 400 }
      );
    }

    const code = employeeCode || generateEmployeeCode();

    const employee = await prisma.employee.create({
      data: {
        employeeName,
        companyId,
        phone: phone || '',
        nativeRelativePhone: nativeRelativePhone || '',
        qidNumber,
        qidExpiry: new Date(qidExpiry),
        qidPhoto: qidPhoto || null,
        passportNumber: passportNumber || null,
        passportExpiry: passportExpiry ? new Date(passportExpiry) : null,
        passportPhoto: passportPhoto || null,
        employeeCode: code,
        notes: notes || null,
        status: status || 'Active',
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(
      { statusCode: 201, data: employee, message: 'Employee created successfully' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating employee:', error);
    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return NextResponse.json(
        { statusCode: 400, message: 'An employee with this QID number already exists.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
