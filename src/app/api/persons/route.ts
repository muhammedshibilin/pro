import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/persons - Fetch all registered owners / persons
export async function GET() {
  try {
    const persons = await prisma.person.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            companies: true,
            employees: true,
          },
        },
      },
    });

    return NextResponse.json(persons);
  } catch (error) {
    console.error('Error fetching persons:', error);
    return NextResponse.json({ error: 'Failed to fetch persons' }, { status: 500 });
  }
}

// POST /api/persons - Create a new owner / person
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, qidNumber, notes } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Person / Owner name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check if person already exists by name (case-insensitive)
    const existing = await prisma.person.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      // Update phone or other details if provided and missing
      const updated = await prisma.person.update({
        where: { id: existing.id },
        data: {
          phone: phone || existing.phone,
          email: email || existing.email,
          qidNumber: qidNumber || existing.qidNumber,
          notes: notes || existing.notes,
        },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    const person = await prisma.person.create({
      data: {
        name: trimmedName,
        phone: phone || '',
        email: email || '',
        qidNumber: qidNumber || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
