import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// POST /api/uploads — Upload document attachment with Cloudinary support & local fallback
export async function POST(req: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const hasCloudinaryKeys = Boolean(cloudName && apiKey && apiSecret);

    if (hasCloudinaryKeys) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'attachments';

    if (!file) {
      return NextResponse.json(
        { statusCode: 400, message: 'No file provided in form data' },
        { status: 400 }
      );
    }

    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { statusCode: 400, message: 'File exceeds maximum 15MB limit' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|webp|gif|svg)$/i)) {
      return NextResponse.json(
        { statusCode: 400, message: 'Unsupported file type. Allowed: PDF, PNG, JPEG, WebP' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Upload to Cloudinary if keys configured
    if (hasCloudinaryKeys) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const uploadOptions: Record<string, unknown> = {
        folder: `doc_expiry/${folder}`,
        resource_type: 'auto',
      };
      if (!isPdf) {
        uploadOptions.transformation = [{ quality: 'auto', fetch_format: 'auto' }];
      }

      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Cloudinary upload failed'));
            } else {
              resolve(result);
            }
          }
        );
        stream.end(buffer);
      });

      return NextResponse.json({
        statusCode: 201,
        provider: 'cloudinary',
        url: uploadResult.secure_url,
        data: {
          filename: file.name,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          size: uploadResult.bytes,
          type: file.type,
        },
        message: 'File uploaded to Cloudinary CDN successfully',
      });
    }

    // 2. Fallback to local storage
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      statusCode: 201,
      provider: 'local',
      url,
      data: {
        filename,
        url,
        size: file.size,
        type: file.type,
      },
      message: 'File uploaded locally',
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
