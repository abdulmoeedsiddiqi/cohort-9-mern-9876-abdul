import { useState } from 'react';

import { NoteGrid } from '../components/notes/NoteGrid';
import { Pagination } from '../components/notes/Pagination';
import { useNotes } from '../hooks/useNotes';
import type { NoteListFilter } from '../api/notes.api';

const PAGE_SIZE = 8;

const TITLES: Record<NoteListFilter, string> = {
  all: 'All notes',
  pinned: 'Pinned',
  video: 'Video notes',
};

export function NotesPage({ filter = 'all' }: { filter?: NoteListFilter }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNotes({ page, pageSize: PAGE_SIZE, filter });

  return (
    <div className="notes-page">
      <p className="notes-page-eyebrow">Workspace</p>
      <h1>{TITLES[filter]}</h1>
      <p className="notes-page-subtitle">{data ? `${data.pagination.total} notes` : 'Loading…'}</p>

      {isLoading && <p className="notes-page-status">Loading your notes…</p>}
      {isError && <p className="notes-page-status">Couldn&apos;t load your notes. Please try again.</p>}
      {data && data.notes.length === 0 && (
        <p className="notes-page-status">
          {filter === 'video' ? 'No video notes yet — record one from + New note.' : 'No notes here yet.'}
        </p>
      )}
      {data && <NoteGrid notes={data.notes} />}
      {data && <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
}
