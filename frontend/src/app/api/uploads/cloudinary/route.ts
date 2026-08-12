import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Check if Cloudinary credentials are provided in environment
const hasCloudinaryKeys = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryKeys) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'company_documents';

    if (!file) {
      return NextResponse.json(
        { statusCode: 400, message: 'No file provided' },
        { status: 400 }
      );
    }

    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { statusCode: 400, message: 'File size exceeds 15MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Cloudinary upload if credentials configured
    if (hasCloudinaryKeys) {
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `doc_expiry/${folder}`,
            resource_type: 'auto',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
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
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        message: 'Photo uploaded to Cloudinary successfully',
      });
    }

    // 2. Fallback to local uploads if Cloudinary keys not provided in .env
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const localUrl = `/uploads/${filename}`;

    return NextResponse.json({
      statusCode: 201,
      provider: 'local',
      url: localUrl,
      publicId: filename,
      message: 'Photo uploaded to local storage (Configure Cloudinary in .env.local for Cloudinary CDN)',
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Photo upload failed';
    return NextResponse.json(
      { statusCode: 500, message },
      { status: 500 }
    );
  }
}
