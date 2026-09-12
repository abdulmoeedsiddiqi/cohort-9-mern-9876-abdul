import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import * as notesApi from '../../api/notes.api';
import type { Note } from '../../types/note.types';
import { NoteCard } from './NoteCard';

jest.mock('../../api/notes.api', () => ({
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
}));
jest.mock('../../lib/assetUrl', () => ({
  resolveAssetUrl: (path: string | null | undefined) => (path ? `http://localhost:4200${path}` : undefined),
}));
const mockedNotesApi = notesApi as jest.Mocked<typeof notesApi>;

const baseNote: Note = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Grocery list',
  content: 'Eggs milk bread',
  type: 'TEXT',
  color: 'yellow',
  pinned: false,
  wordCount: 3,
  summary: null,
  summaryUpdatedAt: null,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderCard(note: Note) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NoteCard note={note} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NoteCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title, preview, and relative edited time', () => {
    renderCard(baseNote);

    expect(screen.getByText('Grocery list')).toBeInTheDocument();
    expect(screen.getByText('Eggs milk bread')).toBeInTheDocument();
    expect(screen.getByText(/Edited/)).toBeInTheDocument();
  });

  it('shows a pin indicator when the note is pinned', () => {
    renderCard({ ...baseNote, pinned: true });
    expect(screen.getByLabelText('Pinned')).toBeInTheDocument();
  });

  it('shows a type badge for non-text notes', () => {
    renderCard({ ...baseNote, type: 'VIDEO' });
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('does not show a type badge for text notes', () => {
    renderCard(baseNote);
    expect(screen.queryByText('Video')).not.toBeInTheDocument();
  });

  it('shows a preview extracted from Tiptap JSON content, not just plain-string content', () => {
    renderCard({
      ...baseNote,
      content: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Buy milk and eggs' }] }],
      },
    });

    expect(screen.getByText('Buy milk and eggs')).toBeInTheDocument();
  });

  it('shows a thumbnail with duration for a video note that has an asset', () => {
    renderCard({
      ...baseNote,
      type: 'VIDEO',
      content: null,
      assets: [
        {
          id: 'asset-1',
          noteId: 'note-1',
          kind: 'VIDEO',
          filePath: 'notes/note-1/recording.webm',
          mimeType: 'video/webm',
          durationSec: 125,
          thumbnailPath: 'notes/note-1/thumbnails/thumb.jpg',
          sizeBytes: 1024,
          createdAt: new Date().toISOString(),
          url: '/uploads/notes/note-1/recording.webm',
          thumbnailUrl: '/uploads/notes/note-1/thumbnails/thumb.jpg',
        },
      ],
    });

    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('calls updateNote to toggle pin from the actions menu', async () => {
    mockedNotesApi.updateNote.mockResolvedValueOnce({ ...baseNote, pinned: true });
    const user = userEvent.setup();
    renderCard(baseNote);

    await user.click(screen.getByLabelText('Note actions'));
    await user.click(screen.getByRole('menuitem', { name: 'Pin' }));

    expect(mockedNotesApi.updateNote).toHaveBeenCalledWith('note-1', { pinned: true });
  });

  it('calls deleteNote from the actions menu', async () => {
    mockedNotesApi.deleteNote.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderCard(baseNote);

    await user.click(screen.getByLabelText('Note actions'));
    await user.click(screen.getByRole('menuitem', { name: 'Move to trash' }));

    expect(mockedNotesApi.deleteNote.mock.calls[0]?.[0]).toBe('note-1');
  });
});
