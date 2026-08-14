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
      where.OR = [
        { companyId },
        { currentWorkingCompanyId: companyId },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        company: true,
        currentWorkingCompany: true,
        person: true,
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

// POST /api/employees — Create employee with Role, Registered Company, and Current Working Company
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employeeName,
      role,
      companyId,
      currentWorkingCompanyId,
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

    const name = typeof employeeName === 'string' ? employeeName.trim() : '';
    const qid = typeof qidNumber === 'string' ? qidNumber.trim() : '';
    const passport = passportNumber ? String(passportNumber).trim() : null;
    const normalizedRole = role && String(role).toUpperCase() === 'OWNER' ? 'OWNER' : 'EMPLOYEE';

    if (!name || name.length < 2) {
      return NextResponse.json(
        { statusCode: 400, message: 'Employee name is required (minimum 2 characters)' },
        { status: 400 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { statusCode: 400, message: 'Registered company is required' },
        { status: 400 }
      );
    }

    if (!qid || qid.length < 5) {
      return NextResponse.json(
        { statusCode: 400, message: 'Qatar ID (QID) must be at least 5 digits' },
        { status: 400 }
      );
    }

    // 1. Validate if QID number already exists
    const existingQid = await prisma.employee.findUnique({
      where: { qidNumber: qid },
    });
    if (existingQid) {
      return NextResponse.json(
        { statusCode: 400, message: `An employee with QID number "${qid}" already exists (${existingQid.employeeName}).` },
        { status: 400 }
      );
    }

    // 2. Validate if Passport number already exists
    if (passport) {
      const existingPassport = await prisma.employee.findFirst({
        where: { passportNumber: { equals: passport, mode: 'insensitive' } },
      });
      if (existingPassport) {
        return NextResponse.json(
          { statusCode: 400, message: `An employee with Passport number "${passport}" already exists (${existingPassport.employeeName}).` },
          { status: 400 }
        );
      }
    }

    const parsedQidExpiry = new Date(qidExpiry);
    if (isNaN(parsedQidExpiry.getTime())) {
      return NextResponse.json(
        { statusCode: 400, message: 'A valid QID expiry date is required' },
        { status: 400 }
      );
    }

    let parsedPassportExpiry: Date | null = null;
    if (passportExpiry) {
      const d = new Date(passportExpiry);
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { statusCode: 400, message: 'Invalid Passport expiry date' },
          { status: 400 }
        );
      }
      parsedPassportExpiry = d;
    }

    // Verify registered company exists
    const registeredCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!registeredCompany) {
      return NextResponse.json(
        { statusCode: 400, message: 'Selected registered company does not exist' },
        { status: 400 }
      );
    }

    // Verify current working company if provided
    let validWorkingCompanyId: string | null = null;
    if (currentWorkingCompanyId && currentWorkingCompanyId.trim()) {
      const workingCompany = await prisma.company.findUnique({
        where: { id: currentWorkingCompanyId.trim() },
      });
      if (workingCompany) {
        validWorkingCompanyId = workingCompany.id;
      }
    }

    const code = employeeCode || generateEmployeeCode();

    const employee = await prisma.employee.create({
      data: {
        employeeName: name,
        role: normalizedRole,
        companyId,
        currentWorkingCompanyId: validWorkingCompanyId,
        phone: phone ? String(phone).trim() : '',
        nativeRelativePhone: nativeRelativePhone ? String(nativeRelativePhone).trim() : '',
        qidNumber: qid,
        qidExpiry: parsedQidExpiry,
        qidPhoto: qidPhoto ? String(qidPhoto).trim() : null,
        passportNumber: passport,
        passportExpiry: parsedPassportExpiry,
        passportPhoto: passportPhoto ? String(passportPhoto).trim() : null,
        employeeCode: code,
        notes: notes ? String(notes).trim() : null,
        status: status || 'Active',
      },
      include: {
        company: true,
        currentWorkingCompany: true,
        person: true,
      },
    });

    // Create initial assignment history entry if assigned to a working company
    if (validWorkingCompanyId) {
      await prisma.companyAssignmentHistory.create({
        data: {
          employeeId: employee.id,
          companyId: validWorkingCompanyId,
          startDate: new Date(),
          notes: 'Initial assignment upon employee creation',
        },
      });
    }

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
