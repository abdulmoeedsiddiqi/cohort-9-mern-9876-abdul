import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import PDFDocument from 'pdfkit';

import { extractPlainText } from '../../utils/tiptapText';
import type { ExportedNote } from './notes.types';

export const EXPORT_FORMATS = ['json', 'txt', 'pdf', 'docx'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export function toPlainText(notes: ExportedNote[]): string {
  if (notes.length === 0) {
    return 'No notes to export.';
  }

  return notes
    .map((note) => `${note.title}\n${'='.repeat(note.title.length)}\n\n${extractPlainText(note.content)}`)
    .join('\n\n\n');
}

export function toPdfBuffer(notes: ExportedNote[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (notes.length === 0) {
      doc.fontSize(14).text('No notes to export.');
    }

    notes.forEach((note, index) => {
      if (index > 0) {
        doc.addPage();
      }
      doc.fontSize(18).text(note.title, { underline: true });
      doc.moveDown();
      doc.fontSize(11).text(extractPlainText(note.content) || '(empty note)');
    });

    doc.end();
  });
}

export async function toDocxBuffer(notes: ExportedNote[]): Promise<Buffer> {
  const children =
    notes.length === 0
      ? [new Paragraph({ text: 'No notes to export.' })]
      : notes.flatMap((note) => [
          new Paragraph({ text: note.title, heading: HeadingLevel.HEADING_1 }),
          ...(extractPlainText(note.content) || '(empty note)')
            .split('\n')
            .map((line) => new Paragraph({ text: line })),
          new Paragraph({ text: '' }),
        ]);

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
