import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { Note } from '../../types/note.types';
import { NoteGrid } from './NoteGrid';

jest.mock('../../api/notes.api', () => ({
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
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
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderGrid(notes: Note[]) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NoteGrid notes={notes} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NoteGrid', () => {
  it('shows an empty state with a call to action when there are no notes', () => {
    renderGrid([]);
    expect(screen.getByText('No notes yet.')).toBeInTheDocument();
    expect(screen.getByText('+ Create your first note')).toBeInTheDocument();
  });

  it('groups pinned notes into their own section', () => {
    renderGrid([
      makeNote({ id: 'a', title: 'Pinned note', pinned: true }),
      makeNote({ id: 'b', title: 'Regular note', pinned: false }),
    ]);

    expect(screen.getByText('Pinned')).toBeInTheDocument();
    expect(screen.getByText('All notes')).toBeInTheDocument();
    expect(screen.getByText('Pinned note')).toBeInTheDocument();
    expect(screen.getByText('Regular note')).toBeInTheDocument();
  });

  it('omits section headers when there are no pinned notes', () => {
    renderGrid([makeNote({ id: 'a', title: 'Only note' })]);

    expect(screen.queryByText('Pinned')).not.toBeInTheDocument();
    expect(screen.queryByText('All notes')).not.toBeInTheDocument();
  });

  it('always renders a New note tile', () => {
    renderGrid([makeNote({ id: 'a', title: 'Only note' })]);
    expect(screen.getByText('New note')).toBeInTheDocument();
  });
});
