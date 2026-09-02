export type NoteType = 'TEXT' | 'VIDEO' | 'MIXED';

export interface NoteAsset {
  id: string;
  noteId: string;
  kind: 'VIDEO';
  filePath: string;
  mimeType: string;
  durationSec: number | null;
  thumbnailPath: string | null;
  sizeBytes: number | null;
  createdAt: string;
  url: string;
  thumbnailUrl: string | null;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: unknown;
  type: NoteType;
  color: string;
  pinned: boolean;
  wordCount: number;
  summary: string | null;
  summaryUpdatedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assets?: NoteAsset[];
}

export interface NoteCounts {
  all: number;
  pinned: number;
  video: number;
  trash: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface NotesListResult {
  notes: Note[];
  pagination: PaginationMeta;
  counts: NoteCounts;
}

export interface TrashListResult {
  notes: Note[];
  pagination: PaginationMeta;
}

export interface ExportedNote {
  title: string;
  content: unknown;
  type: NoteType;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotesExport {
  exportedAt: string;
  notes: ExportedNote[];
}
