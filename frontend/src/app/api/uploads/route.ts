import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// POST /api/uploads — Upload document attachment
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { statusCode: 400, message: 'No file provided in form data' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { statusCode: 400, message: 'File exceeds maximum 10MB limit' },
        { status: 400 }
      );
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { statusCode: 400, message: 'Unsupported file type. Allowed: PDF, PNG, JPEG, WebP' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      statusCode: 201,
      url,
      data: {
        filename,
        url,
        size: file.size,
        type: file.type,
      },
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
