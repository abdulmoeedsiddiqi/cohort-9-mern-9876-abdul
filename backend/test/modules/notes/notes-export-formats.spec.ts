import { expect } from 'chai';

import { toDocxBuffer, toPdfBuffer, toPlainText } from '../../../src/modules/notes/notes-export-formats';
import type { ExportedNote } from '../../../src/modules/notes/notes.types';

const sampleNotes: ExportedNote[] = [
  {
    title: 'Grocery list',
    content: 'Eggs milk bread',
    type: 'TEXT',
    color: 'yellow',
    pinned: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    title: 'Tiptap note',
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Buy milk' }] }],
    },
    type: 'TEXT',
    color: 'blue',
    pinned: true,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('notes-export-formats', () => {
  describe('toPlainText', () => {
    it('includes each note title and its extracted content', () => {
      const text = toPlainText(sampleNotes);

      expect(text).to.include('Grocery list');
      expect(text).to.include('Eggs milk bread');
      expect(text).to.include('Tiptap note');
      expect(text).to.include('Buy milk');
    });

    it('returns a placeholder for an empty note list', () => {
      expect(toPlainText([])).to.equal('No notes to export.');
    });
  });

  describe('toPdfBuffer', () => {
    it('produces a non-empty buffer starting with the PDF signature', async () => {
      const buffer = await toPdfBuffer(sampleNotes);

      expect(buffer.length).to.be.greaterThan(0);
      expect(buffer.subarray(0, 4).toString('ascii')).to.equal('%PDF');
    });

    it('still produces a valid PDF for an empty note list', async () => {
      const buffer = await toPdfBuffer([]);
      expect(buffer.subarray(0, 4).toString('ascii')).to.equal('%PDF');
    });
  });

  describe('toDocxBuffer', () => {
    it('produces a non-empty buffer starting with the zip signature docx uses', async () => {
      const buffer = await toDocxBuffer(sampleNotes);

      expect(buffer.length).to.be.greaterThan(0);
      expect(buffer.subarray(0, 2).toString('ascii')).to.equal('PK');
    });

    it('still produces a valid docx for an empty note list', async () => {
      const buffer = await toDocxBuffer([]);
      expect(buffer.subarray(0, 2).toString('ascii')).to.equal('PK');
    });
  });
});
