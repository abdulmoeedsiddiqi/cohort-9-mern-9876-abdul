import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import * as notesApi from '../api/notes.api';
import { NotesPage } from './NotesPage';

jest.mock('../api/notes.api', () => ({
  listNotes: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
}));
jest.mock('../lib/assetUrl', () => ({
  resolveAssetUrl: (path: string | null | undefined) => (path ? `http://localhost:4200${path}` : undefined),
}));
const mockedNotesApi = notesApi as jest.Mocked<typeof notesApi>;

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <NotesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NotesPage search', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('passes the q search param from the URL through to listNotes', async () => {
    mockedNotesApi.listNotes.mockResolvedValueOnce({
      notes: [],
      pagination: { page: 1, pageSize: 8, total: 0, totalPages: 1 },
      counts: { all: 0, pinned: 0, video: 0, trash: 0 },
    });

    renderAt('/notes?q=grocery');

    await waitFor(() =>
      expect(mockedNotesApi.listNotes).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'grocery', filter: 'all' }),
      ),
    );
  });

  it('shows a search-specific heading and empty state when q is set', async () => {
    mockedNotesApi.listNotes.mockResolvedValueOnce({
      notes: [],
      pagination: { page: 1, pageSize: 8, total: 0, totalPages: 1 },
      counts: { all: 0, pinned: 0, video: 0, trash: 0 },
    });

    renderAt('/notes?q=nonexistent');

    expect(await screen.findByText('Search results for "nonexistent"')).toBeInTheDocument();
    expect(await screen.findByText('No notes match "nonexistent".')).toBeInTheDocument();
  });

  it('omits q when there is no search param', async () => {
    mockedNotesApi.listNotes.mockResolvedValueOnce({
      notes: [],
      pagination: { page: 1, pageSize: 8, total: 0, totalPages: 1 },
      counts: { all: 0, pinned: 0, video: 0, trash: 0 },
    });

    renderAt('/notes');

    await waitFor(() =>
      expect(mockedNotesApi.listNotes).toHaveBeenCalledWith(
        expect.objectContaining({ q: undefined, filter: 'all' }),
      ),
    );
    expect(await screen.findByText('All notes')).toBeInTheDocument();
  });
});
