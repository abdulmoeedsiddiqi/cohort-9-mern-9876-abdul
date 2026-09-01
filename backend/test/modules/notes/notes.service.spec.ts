import { expect } from 'chai';

import * as notesService from '../../../src/modules/notes/notes.service';

interface FakeNote {
  id: string;
  userId: string;
  title: string;
  content: unknown;
  type: 'TEXT' | 'VIDEO' | 'MIXED';
  color: string;
  pinned: boolean;
  wordCount: number;
  deletedAt: Date | null;
}

function makeFakeRepository(initialNotes: FakeNote[] = []) {
  const notes = [...initialNotes];

  return {
    notes,
    findManyForUser: async ({ userId }: { userId: string }) =>
      notes.filter((n) => n.userId === userId && !n.deletedAt),
    countForUser: async (userId: string) => notes.filter((n) => n.userId === userId && !n.deletedAt).length,
    countPinnedForUser: async (userId: string) =>
      notes.filter((n) => n.userId === userId && !n.deletedAt && n.pinned).length,
    countVideoForUser: async (userId: string) =>
      notes.filter((n) => n.userId === userId && !n.deletedAt && n.type !== 'TEXT').length,
    countTrashForUser: async (userId: string) =>
      notes.filter((n) => n.userId === userId && n.deletedAt).length,
    findOneForUser: async (id: string, userId: string) =>
      notes.find((n) => n.id === id && n.userId === userId && !n.deletedAt) ?? null,
    findManyTrashForUser: async ({ userId }: { userId: string }) =>
      notes.filter((n) => n.userId === userId && n.deletedAt),
    findOneTrashedForUser: async (id: string, userId: string) =>
      notes.find((n) => n.id === id && n.userId === userId && n.deletedAt) ?? null,
    create: async (
      userId: string,
      data: { title: string; content?: unknown; type: FakeNote['type']; color: string; wordCount: number },
    ) => {
      const note: FakeNote = {
        id: `note-${notes.length + 1}`,
        userId,
        title: data.title,
        content: data.content ?? null,
        type: data.type,
        color: data.color,
        pinned: false,
        wordCount: data.wordCount,
        deletedAt: null,
      };
      notes.push(note);
      return note;
    },
    update: async (id: string, data: Partial<FakeNote>) => {
      const note = notes.find((n) => n.id === id)!;
      Object.assign(note, Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)));
      return note;
    },
    softDelete: async (id: string) => {
      const note = notes.find((n) => n.id === id)!;
      note.deletedAt = new Date();
      return note;
    },
    restore: async (id: string) => {
      const note = notes.find((n) => n.id === id)!;
      note.deletedAt = null;
      return note;
    },
    purge: async (id: string) => {
      const index = notes.findIndex((n) => n.id === id);
      notes.splice(index, 1);
    },
  };
}

describe('notes.service', () => {
  describe('createNote', () => {
    it('computes wordCount from string content and defaults type/color', async () => {
      const repository = makeFakeRepository();

      const note = await notesService.createNote(
        'user-1',
        { title: 'Grocery list', content: 'Eggs milk bread' },
        repository,
      );

      expect(note).to.include({ title: 'Grocery list', type: 'TEXT', color: 'yellow', wordCount: 3 });
    });
  });

  describe('listNotes', () => {
    it('returns notes, pagination, and counts for the user', async () => {
      const repository = makeFakeRepository();
      await notesService.createNote('user-1', { title: 'Note 1' }, repository);
      await notesService.createNote('user-1', { title: 'Note 2', type: 'VIDEO' }, repository);
      await notesService.createNote('user-2', { title: 'Someone else' }, repository);

      const result = await notesService.listNotes('user-1', 1, 8, repository);

      expect(result.notes).to.have.length(2);
      expect(result.counts).to.deep.equal({ all: 2, pinned: 0, video: 1, trash: 0 });
      expect(result.pagination).to.deep.equal({ page: 1, pageSize: 8, total: 2, totalPages: 1 });
    });
  });

  describe('getNote', () => {
    it('throws 404 when the note does not exist or belongs to someone else', async () => {
      const repository = makeFakeRepository();

      try {
        await notesService.getNote('user-1', 'nonexistent', repository);
        expect.fail('expected getNote to throw');
      } catch (err) {
        expect((err as { statusCode: number }).statusCode).to.equal(404);
      }
    });
  });

  describe('updateNote', () => {
    it('recomputes wordCount when content changes', async () => {
      const repository = makeFakeRepository();
      const note = await notesService.createNote('user-1', { title: 'Old', content: 'one two' }, repository);

      const updated = await notesService.updateNote(
        'user-1',
        note.id,
        { content: 'one two three four' },
        repository,
      );

      expect(updated.wordCount).to.equal(4);
    });

    it('throws 404 for a note owned by another user', async () => {
      const repository = makeFakeRepository();
      const note = await notesService.createNote('user-1', { title: 'Mine' }, repository);

      try {
        await notesService.updateNote('user-2', note.id, { title: 'Hijacked' }, repository);
        expect.fail('expected updateNote to throw');
      } catch (err) {
        expect((err as { statusCode: number }).statusCode).to.equal(404);
      }
    });
  });

  describe('softDeleteNote', () => {
    it('marks the note as deleted', async () => {
      const repository = makeFakeRepository();
      const note = await notesService.createNote('user-1', { title: 'To trash' }, repository);

      await notesService.softDeleteNote('user-1', note.id, repository);

      expect(repository.notes.find((n) => n.id === note.id)?.deletedAt).to.not.equal(null);
    });
  });

  describe('listTrash', () => {
    it('returns only the trashed notes for the user', async () => {
      const repository = makeFakeRepository();
      const kept = await notesService.createNote('user-1', { title: 'Keep' }, repository);
      const trashed = await notesService.createNote('user-1', { title: 'Trash me' }, repository);
      await notesService.softDeleteNote('user-1', trashed.id, repository);

      const result = await notesService.listTrash('user-1', 1, 8, repository);

      expect(result.notes.map((n) => n.id)).to.deep.equal([trashed.id]);
      expect(result.notes.map((n) => n.id)).to.not.include(kept.id);
      expect(result.pagination.total).to.equal(1);
    });
  });

  describe('restoreNote', () => {
    it('clears deletedAt for a trashed note', async () => {
      const repository = makeFakeRepository();
      const note = await notesService.createNote('user-1', { title: 'To restore' }, repository);
      await notesService.softDeleteNote('user-1', note.id, repository);

      const restored = await notesService.restoreNote('user-1', note.id, repository);

      expect(restored.deletedAt).to.equal(null);
    });

    it('throws 404 when the note is not in trash', async () => {
      const repository = makeFakeRepository();
      const note = await notesService.createNote('user-1', { title: 'Not trashed' }, repository);

      try {
        await notesService.restoreNote('user-1', note.id, repository);
        expect.fail('expected restoreNote to throw');
      } catch (err) {
        expect((err as { statusCode: number }).statusCode).to.equal(404);
      }
    });
  });

  describe('purgeNote', () => {
    it('permanently removes a trashed note', async () => {
      const repository = makeFakeRepository();
      const note = await notesService.createNote('user-1', { title: 'Gone forever' }, repository);
      await notesService.softDeleteNote('user-1', note.id, repository);

      await notesService.purgeNote('user-1', note.id, repository);

      expect(repository.notes.find((n) => n.id === note.id)).to.equal(undefined);
    });

    it('throws 404 when the note is not in trash', async () => {
      const repository = makeFakeRepository();
      const note = await notesService.createNote('user-1', { title: 'Not trashed' }, repository);

      try {
        await notesService.purgeNote('user-1', note.id, repository);
        expect.fail('expected purgeNote to throw');
      } catch (err) {
        expect((err as { statusCode: number }).statusCode).to.equal(404);
      }
    });
  });
});
