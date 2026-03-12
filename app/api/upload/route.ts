import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

const EXTENSION_MAP: Record<string, string> = {
  txt: 'text',
  md: 'text',
  csv: 'text',
  json: 'text',
  pdf: 'pdf',
  docx: 'docx',
  doc: 'docx',
};

const MIME_MAP: Record<string, string> = {
  'text/plain': 'text',
  'text/markdown': 'text',
  'text/csv': 'text',
  'application/json': 'text',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'docx',
};

function getFileCategory(file: File): string | null {
  const mimeCategory = MIME_MAP[file.type];
  if (mimeCategory) return mimeCategory;

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_MAP[ext] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const category = getFileCategory(file);

    if (!category) {
      return NextResponse.json(
        {
          error:
            'Unsupported file type. Supported formats: PDF, DOCX, DOC, TXT, MD, CSV, JSON',
        },
        { status: 400 }
      );
    }

    // Strip file extension from name for use as title
    const title = file.name.replace(/\.[^/.]+$/, '');

    if (category === 'text') {
      const text = await file.text();
      if (!text.trim()) {
        return NextResponse.json({ error: 'File appears to be empty' }, { status: 400 });
      }
      return NextResponse.json({ content: text, title, type: 'text' });
    }

    if (category === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      if (!result.value.trim()) {
        return NextResponse.json(
          { error: 'Could not extract text from the Word document' },
          { status: 400 }
        );
      }
      return NextResponse.json({ content: result.value, title, type: 'text' });
    }

    if (category === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return NextResponse.json({ content: base64, title, type: 'pdf' });
    }

    return NextResponse.json({ error: 'Unexpected error processing file' }, { status: 500 });
  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json(
      { error: 'Failed to process uploaded file' },
      { status: 500 }
    );
  }
}
