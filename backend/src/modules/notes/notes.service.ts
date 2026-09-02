import type { Note } from '@prisma/client';

import { ApiError } from '../../utils/ApiError';
import { countWords } from '../../utils/wordCount';
import * as notesRepository from './notes.repository';
import { CreateNoteInput, NoteCounts, NoteWithAssets, PaginationMeta, UpdateNoteInput } from './notes.types';

type NotesRepository = typeof notesRepository;

function computeWordCount(content: unknown): number {
  return typeof content === 'string' ? countWords(content) : 0;
}

export async function createNote(
  userId: string,
  input: CreateNoteInput,
  repository: NotesRepository = notesRepository,
): Promise<Note> {
  return repository.create(userId, {
    title: input.title,
    content: input.content,
    type: input.type ?? 'TEXT',
    color: input.color ?? 'yellow',
    wordCount: computeWordCount(input.content),
  });
}

export async function listNotes(
  userId: string,
  page: number,
  pageSize: number,
  repository: NotesRepository = notesRepository,
): Promise<{ notes: Note[]; pagination: PaginationMeta; counts: NoteCounts }> {
  const [notes, total, pinned, video, trash] = await Promise.all([
    repository.findManyForUser({ userId, page, pageSize }),
    repository.countForUser(userId),
    repository.countPinnedForUser(userId),
    repository.countVideoForUser(userId),
    repository.countTrashForUser(userId),
  ]);

  return {
    notes,
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    counts: { all: total, pinned, video, trash },
  };
}

export async function getNote(
  userId: string,
  noteId: string,
  repository: NotesRepository = notesRepository,
): Promise<NoteWithAssets> {
  const note = await repository.findOneForUser(noteId, userId);
  if (!note) {
    throw ApiError.notFound('Note not found');
  }
  return note;
}

export async function updateNote(
  userId: string,
  noteId: string,
  input: UpdateNoteInput,
  repository: NotesRepository = notesRepository,
): Promise<Note> {
  const existing = await repository.findOneForUser(noteId, userId);
  if (!existing) {
    throw ApiError.notFound('Note not found');
  }

  const wordCount = input.content !== undefined ? computeWordCount(input.content) : undefined;

  return repository.update(noteId, {
    title: input.title,
    content: input.content,
    type: input.type,
    color: input.color,
    pinned: input.pinned,
    wordCount,
  });
}

export async function softDeleteNote(
  userId: string,
  noteId: string,
  repository: NotesRepository = notesRepository,
): Promise<void> {
  const existing = await repository.findOneForUser(noteId, userId);
  if (!existing) {
    throw ApiError.notFound('Note not found');
  }

  await repository.softDelete(noteId);
}

export async function listTrash(
  userId: string,
  page: number,
  pageSize: number,
  repository: NotesRepository = notesRepository,
): Promise<{ notes: Note[]; pagination: PaginationMeta }> {
  const [notes, total] = await Promise.all([
    repository.findManyTrashForUser({ userId, page, pageSize }),
    repository.countTrashForUser(userId),
  ]);

  return {
    notes,
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function restoreNote(
  userId: string,
  noteId: string,
  repository: NotesRepository = notesRepository,
): Promise<Note> {
  const existing = await repository.findOneTrashedForUser(noteId, userId);
  if (!existing) {
    throw ApiError.notFound('Note not found in trash');
  }

  return repository.restore(noteId);
}

export async function purgeNote(
  userId: string,
  noteId: string,
  repository: NotesRepository = notesRepository,
): Promise<void> {
  const existing = await repository.findOneTrashedForUser(noteId, userId);
  if (!existing) {
    throw ApiError.notFound('Note not found in trash');
  }

  await repository.purge(noteId);
}
