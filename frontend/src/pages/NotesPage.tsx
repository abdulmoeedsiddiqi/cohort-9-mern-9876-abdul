import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? undefined;
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNotes({ page, pageSize: PAGE_SIZE, filter, q });

  useEffect(() => {
    setPage(1);
  }, [filter, q]);

  const heading = q ? `Search results for "${q}"` : TITLES[filter];

  return (
    <div className="notes-page">
      <p className="notes-page-eyebrow">Workspace</p>
      <h1>{heading}</h1>
      <p className="notes-page-subtitle">{data ? `${data.pagination.total} notes` : 'Loading…'}</p>

      {isLoading && <p className="notes-page-status">Loading your notes…</p>}
      {isError && <p className="notes-page-status">Couldn&apos;t load your notes. Please try again.</p>}
      {data && data.notes.length === 0 && (
        <p className="notes-page-status">
          {q
            ? `No notes match "${q}".`
            : filter === 'video'
              ? 'No video notes yet — record one from + New note.'
              : 'No notes here yet.'}
        </p>
      )}
      {data && <NoteGrid notes={data.notes} />}
      {data && <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
}
