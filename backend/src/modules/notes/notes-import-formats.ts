import path from 'path';

import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

import { ApiError } from '../../utils/ApiError';

export const IMPORTABLE_FILE_EXTENSIONS = ['.txt', '.pdf', '.docx'] as const;

export async function extractTextFromFile(buffer: Buffer, originalname: string): Promise<string> {
  const ext = path.extname(originalname).toLowerCase();

  if (ext === '.txt') {
    return buffer.toString('utf-8');
  }

  if (ext === '.pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw ApiError.badRequest('File must be a .txt, .pdf, or .docx file');
}

export function titleFromFilename(originalname: string): string {
  const withoutExt = originalname.replace(/\.[^./]+$/, '').trim();
  return withoutExt || 'Imported note';
}
