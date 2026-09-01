export type NoteType = 'TEXT' | 'VIDEO' | 'MIXED';

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
