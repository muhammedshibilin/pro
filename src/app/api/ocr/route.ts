import { NextRequest, NextResponse } from 'next/server';

// POST /api/ocr — Optical Character Recognition processing endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentUrl, documentType } = body;

    if (!documentUrl) {
      return NextResponse.json(
        { statusCode: 400, message: 'documentUrl is required' },
        { status: 400 }
      );
    }

    // High confidence simulated OCR extraction engine
    const isQid = documentType?.toLowerCase().includes('qid') || documentUrl.toLowerCase().includes('qid');
    
    const extractionResult = {
      raw: `OCR Extracted Text from ${documentUrl}`,
      documentType: isQid ? 'Qatar ID (QID)' : (documentType || 'Commercial Registration (CR)'),
      fields: isQid
        ? {
            qidNumber: { value: '290' + Math.floor(10000000 + Math.random() * 90000000), confidence: 0.98 },
            name: { value: 'Extracted Employee Name', confidence: 0.95 },
            nationality: { value: 'Qatar / Expatriate', confidence: 0.92 },
            expiryDate: { value: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0], confidence: 0.97 },
          }
        : {
            crNumber: { value: 'CR-' + Math.floor(100000 + Math.random() * 900000), confidence: 0.96 },
            companyName: { value: 'Extracted Company Name LLC', confidence: 0.94 },
            expiryDate: { value: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0], confidence: 0.98 },
          },
      confidence: 0.96,
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      statusCode: 200,
      data: extractionResult,
      message: 'OCR extraction successful',
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { statusCode: 500, message: 'OCR processing failed' },
      { status: 500 }
    );
  }
}
