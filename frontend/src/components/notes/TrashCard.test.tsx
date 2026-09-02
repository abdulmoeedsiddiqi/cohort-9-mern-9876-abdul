import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as notesApi from '../../api/notes.api';
import type { Note } from '../../types/note.types';
import { TrashCard } from './TrashCard';

jest.mock('../../api/notes.api', () => ({
  restoreNote: jest.fn(),
  purgeNote: jest.fn(),
}));
jest.mock('../../lib/assetUrl', () => ({
  resolveAssetUrl: (path: string | null | undefined) => (path ? `http://localhost:4200${path}` : undefined),
}));
const mockedNotesApi = notesApi as jest.Mocked<typeof notesApi>;

const trashedNote: Note = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Old grocery list',
  content: 'Eggs milk bread',
  type: 'TEXT',
  color: 'yellow',
  pinned: false,
  wordCount: 3,
  summary: null,
  summaryUpdatedAt: null,
  deletedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderCard(note: Note) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TrashCard note={note} />
    </QueryClientProvider>,
  );
}

describe('TrashCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title, preview, and a deleted timestamp', () => {
    renderCard(trashedNote);

    expect(screen.getByText('Old grocery list')).toBeInTheDocument();
    expect(screen.getByText('Eggs milk bread')).toBeInTheDocument();
    expect(screen.getByText(/Deleted/)).toBeInTheDocument();
  });

  it('calls restoreNote when Restore is clicked', async () => {
    mockedNotesApi.restoreNote.mockResolvedValueOnce({ ...trashedNote, deletedAt: null });
    const user = userEvent.setup();
    renderCard(trashedNote);

    await user.click(screen.getByRole('button', { name: 'Restore' }));

    expect(mockedNotesApi.restoreNote.mock.calls[0]?.[0]).toBe('note-1');
  });

  it('asks for confirmation and calls purgeNote when confirmed', async () => {
    window.confirm = jest.fn(() => true);
    mockedNotesApi.purgeNote.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderCard(trashedNote);

    await user.click(screen.getByRole('button', { name: 'Delete forever' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedNotesApi.purgeNote.mock.calls[0]?.[0]).toBe('note-1');
  });

  it('does not call purgeNote when confirmation is declined', async () => {
    window.confirm = jest.fn(() => false);
    const user = userEvent.setup();
    renderCard(trashedNote);

    await user.click(screen.getByRole('button', { name: 'Delete forever' }));

    expect(mockedNotesApi.purgeNote).not.toHaveBeenCalled();
  });
});
