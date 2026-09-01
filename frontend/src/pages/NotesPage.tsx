import { useState } from 'react';

import { NoteGrid } from '../components/notes/NoteGrid';
import { Pagination } from '../components/notes/Pagination';
import { useNotes } from '../hooks/useNotes';

const PAGE_SIZE = 8;

export function NotesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNotes({ page, pageSize: PAGE_SIZE });

  return (
    <div className="notes-page">
      <p className="notes-page-eyebrow">Workspace</p>
      <h1>All notes</h1>
      <p className="notes-page-subtitle">{data ? `${data.pagination.total} notes` : 'Loading…'}</p>

      {isLoading && <p className="notes-page-status">Loading your notes…</p>}
      {isError && <p className="notes-page-status">Couldn&apos;t load your notes. Please try again.</p>}
      {data && <NoteGrid notes={data.notes} />}
      {data && <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
}
