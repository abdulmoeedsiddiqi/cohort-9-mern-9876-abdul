import type { Note, NoteAsset, NoteType, NotesListResult, TrashListResult } from '../types/note.types';
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

export type NoteListFilter = 'all' | 'pinned' | 'video';

export interface ListNotesParams {
  page?: number;
  pageSize?: number;
  filter?: NoteListFilter;
  q?: string;
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

export async function summarizeNote(
  idOrInput: string | { id: string; content?: unknown },
  maybeContent?: unknown,
): Promise<Note> {
  const id = typeof idOrInput === 'string' ? idOrInput : idOrInput.id;
  const content = typeof idOrInput === 'string' ? maybeContent : idOrInput.content;
  const res = await apiClient.post<{ note: Note }>(
    `/notes/${id}/summarize`,
    content !== undefined ? { content } : undefined,
  );
  return res.data.note;
}

export type ExportFormat = 'json' | 'txt' | 'pdf' | 'docx';

export interface ExportedFile {
  blob: Blob;
  filename: string;
}

export async function exportNotesFile(format: ExportFormat): Promise<ExportedFile> {
  const res = await apiClient.get('/notes/export', {
    params: { format },
    responseType: 'blob',
  });
  const disposition = res.headers['content-disposition'] as string | undefined;
  const filename = disposition?.match(/filename="([^"]+)"/)?.[1] ?? `notes-export.${format}`;
  return { blob: res.data as Blob, filename };
}

export interface ImportNoteInput {
  title: string;
  content?: unknown;
  type?: NoteType;
  color?: string;
  pinned?: boolean;
}

export async function importNotes(notes: ImportNoteInput[]): Promise<{ imported: number }> {
  const res = await apiClient.post<{ imported: number }>('/notes/import', { notes });
  return res.data;
}

export async function importNoteFile(file: File): Promise<{ imported: number; note: Note }> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<{ imported: number; note: Note }>('/notes/import/file', form);
  return res.data;
}

export interface UploadVideoAssetInput {
  video: Blob;
  thumbnail?: Blob | null;
  durationSec: number;
}

export async function uploadVideoAsset(noteId: string, input: UploadVideoAssetInput): Promise<NoteAsset> {
  const form = new FormData();
  form.append('durationSec', String(Math.max(1, Math.round(input.durationSec))));
  form.append('video', input.video, 'recording.webm');
  if (input.thumbnail) {
    form.append('thumbnail', input.thumbnail, 'thumbnail.jpg');
  }

  const res = await apiClient.post<{ asset: NoteAsset }>(`/notes/${noteId}/assets`, form);
  return res.data.asset;
}

export async function deleteVideoAsset(noteId: string, assetId: string): Promise<void> {
  await apiClient.delete(`/notes/${noteId}/assets/${assetId}`);
}
