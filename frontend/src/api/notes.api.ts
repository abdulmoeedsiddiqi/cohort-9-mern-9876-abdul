import type { Note, NoteType, NotesListResult, TrashListResult } from '../types/note.types';
import { apiClient } from './client';

export interface CreateNoteInput {
  title: string;
  content?: unknown;
  type?: NoteType;
  color?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: unknown;
  type?: NoteType;
  color?: string;
  pinned?: boolean;
}

export interface ListNotesParams {
  page?: number;
  pageSize?: number;
}

export async function listNotes(params: ListNotesParams = {}): Promise<NotesListResult> {
  const res = await apiClient.get<NotesListResult>('/notes', { params });
  return res.data;
}

export async function listTrash(params: ListNotesParams = {}): Promise<TrashListResult> {
  const res = await apiClient.get<TrashListResult>('/notes/trash', { params });
  return res.data;
}

export async function getNote(id: string): Promise<Note> {
  const res = await apiClient.get<{ note: Note }>(`/notes/${id}`);
  return res.data.note;
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const res = await apiClient.post<{ note: Note }>('/notes', input);
  return res.data.note;
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
  const res = await apiClient.patch<{ note: Note }>(`/notes/${id}`, input);
  return res.data.note;
}

export async function deleteNote(id: string): Promise<void> {
  await apiClient.delete(`/notes/${id}`);
}

export async function restoreNote(id: string): Promise<Note> {
  const res = await apiClient.post<{ note: Note }>(`/notes/${id}/restore`);
  return res.data.note;
}

export async function purgeNote(id: string): Promise<void> {
  await apiClient.delete(`/notes/${id}/purge`);
}
