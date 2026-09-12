import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import * as notesApi from '../api/notes.api';
import { useCreateNote, useNotes } from './useNotes';

jest.mock('../api/notes.api', () => ({
  listNotes: jest.fn(),
  listTrash: jest.fn(),
  getNote: jest.fn(),
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  restoreNote: jest.fn(),
  purgeNote: jest.fn(),
}));
const mockedNotesApi = notesApi as jest.Mocked<typeof notesApi>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useNotes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches notes and exposes them once loaded', async () => {
    const payload = {
      notes: [{ id: '1', title: 'Note 1' }],
      pagination: { page: 1, pageSize: 8, total: 1, totalPages: 1 },
      counts: { all: 1, pinned: 0, video: 0, trash: 0 },
    };
    mockedNotesApi.listNotes.mockResolvedValueOnce(payload as never);

    const { result } = renderHook(() => useNotes(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(payload);
    expect(mockedNotesApi.listNotes).toHaveBeenCalledWith({});
  });

  it('useCreateNote invalidates the notes cache on success', async () => {
    mockedNotesApi.createNote.mockResolvedValueOnce({ id: '1', title: 'New note' } as never);
    mockedNotesApi.listNotes.mockResolvedValue({
      notes: [],
      pagination: { page: 1, pageSize: 8, total: 0, totalPages: 1 },
      counts: { all: 0, pinned: 0, video: 0, trash: 0 },
    } as never);

    const wrapper = createWrapper();
    const { result: listResult } = renderHook(() => useNotes(), { wrapper });
    await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

    const { result: createResult } = renderHook(() => useCreateNote(), { wrapper });
    await createResult.current.mutateAsync({ title: 'New note' });

    await waitFor(() => expect(mockedNotesApi.listNotes).toHaveBeenCalledTimes(2));
  });
});
