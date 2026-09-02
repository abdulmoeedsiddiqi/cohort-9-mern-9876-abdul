import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import * as notesApi from '../api/notes.api';
import { ThemeProvider } from '../context/ThemeContext';
import type { Note } from '../types/note.types';
import { NoteEditorPage } from './NoteEditorPage';

jest.mock('../api/notes.api', () => ({
  createNote: jest.fn(),
  updateNote: jest.fn(),
  getNote: jest.fn(),
}));
const mockedNotesApi = notesApi as jest.Mocked<typeof notesApi>;

const existingNote: Note = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Existing note',
  content: 'Some existing content',
  type: 'TEXT',
  color: 'blue',
  pinned: false,
  wordCount: 3,
  summary: null,
  summaryUpdatedAt: null,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/notes/new" element={<NoteEditorPage />} />
            <Route path="/notes/:id" element={<NoteEditorPage />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('NoteEditorPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a new note with the entered title, content, and color', async () => {
    mockedNotesApi.createNote.mockResolvedValueOnce({ ...existingNote, id: 'new-note' });
    mockedNotesApi.getNote.mockResolvedValue(existingNote);
    const user = userEvent.setup();
    renderAt('/notes/new');

    await user.type(screen.getByPlaceholderText('Untitled note'), 'My new note');
    const contentEditor = screen.getByRole('textbox', { name: 'Note content' });
    await user.click(contentEditor);
    await user.type(contentEditor, 'Hello world');
    await user.click(screen.getByLabelText('Blue'));
    await user.click(screen.getByRole('button', { name: /Save note/ }));

    await waitFor(() => expect(mockedNotesApi.createNote).toHaveBeenCalled());
    const payload = mockedNotesApi.createNote.mock.calls[0]?.[0];
    expect(payload?.title).toBe('My new note');
    expect(payload?.color).toBe('blue');
    expect(payload?.type).toBe('TEXT');
    expect(JSON.stringify(payload?.content)).toContain('Hello world');
  });

  it('shows a validation error when saving without a title', async () => {
    const user = userEvent.setup();
    renderAt('/notes/new');

    await user.click(screen.getByRole('button', { name: /Save note/ }));

    expect(await screen.findByText('Give your note a title before saving.')).toBeInTheDocument();
    expect(mockedNotesApi.createNote).not.toHaveBeenCalled();
  });

  it('pre-fills the form from an existing note when editing', async () => {
    mockedNotesApi.getNote.mockResolvedValueOnce(existingNote);
    renderAt('/notes/note-1');

    expect(await screen.findByDisplayValue('Existing note')).toBeInTheDocument();
    expect(await screen.findByText('Some existing content')).toBeInTheDocument();
    expect(screen.getByLabelText('Blue')).toHaveAttribute('aria-pressed', 'true');
  });

  it('updates an existing note on save', async () => {
    mockedNotesApi.getNote.mockResolvedValueOnce(existingNote);
    mockedNotesApi.updateNote.mockResolvedValueOnce({ ...existingNote, title: 'Updated title' });
    const user = userEvent.setup();
    renderAt('/notes/note-1');

    const titleInput = await screen.findByDisplayValue('Existing note');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');
    await user.click(screen.getByRole('button', { name: /Save note/ }));

    await waitFor(() =>
      expect(mockedNotesApi.updateNote).toHaveBeenCalledWith('note-1', {
        title: 'Updated title',
        content: 'Some existing content',
        type: 'TEXT',
        color: 'blue',
      }),
    );
  });

  it('hides the text editor and shows a placeholder for video type', async () => {
    const user = userEvent.setup();
    renderAt('/notes/new');

    await user.click(screen.getByRole('tab', { name: 'Video' }));

    expect(screen.queryByRole('textbox', { name: 'Note content' })).not.toBeInTheDocument();
    expect(screen.getByText('Video recording is coming soon.')).toBeInTheDocument();
  });
});
