import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import type { Note } from '../../types/note.types';
import { TrashGrid } from './TrashGrid';

jest.mock('../../api/notes.api', () => ({
  restoreNote: jest.fn(),
  purgeNote: jest.fn(),
}));
jest.mock('../../lib/assetUrl', () => ({
  resolveAssetUrl: (path: string | null | undefined) => (path ? `http://localhost:4200${path}` : undefined),
}));

function makeNote(overrides: Partial<Note>): Note {
  return {
    id: 'note-1',
    userId: 'user-1',
    title: 'Note',
    content: null,
    type: 'TEXT',
    color: 'yellow',
    pinned: false,
    wordCount: 0,
    summary: null,
    summaryUpdatedAt: null,
    deletedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderGrid(notes: Note[]) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <TrashGrid notes={notes} />
    </QueryClientProvider>,
  );
}

describe('TrashGrid', () => {
  it('shows an empty state when there are no trashed notes', () => {
    renderGrid([]);
    expect(screen.getByText('Trash is empty.')).toBeInTheDocument();
  });

  it('renders a card for each trashed note', () => {
    renderGrid([makeNote({ id: 'a', title: 'First' }), makeNote({ id: 'b', title: 'Second' })]);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
