import { useState } from 'react';

import { Pagination } from '../components/notes/Pagination';
import { TrashGrid } from '../components/notes/TrashGrid';
import { useTrash } from '../hooks/useNotes';

const PAGE_SIZE = 8;

export function TrashPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useTrash({ page, pageSize: PAGE_SIZE });

  return (
    <div className="notes-page">
      <p className="notes-page-eyebrow">Workspace</p>
      <h1>Trash</h1>
      <p className="notes-page-subtitle">
        {data ? `${data.pagination.total} notes` : 'Loading…'} · Deleted notes are kept here until you delete
        them forever
      </p>

      {isLoading && <p className="notes-page-status">Loading trash…</p>}
      {isError && <p className="notes-page-status">Couldn&apos;t load your trash. Please try again.</p>}
      {data && <TrashGrid notes={data.notes} />}
      {data && <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
}
