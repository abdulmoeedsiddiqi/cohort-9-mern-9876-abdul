import { apiClient } from './client';
import * as notesApi from './notes.api';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('notes.api', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('listNotes calls GET /notes with params and returns the payload', async () => {
    const payload = {
      notes: [],
      pagination: { page: 1, pageSize: 8, total: 0, totalPages: 1 },
      counts: { all: 0, pinned: 0, video: 0, trash: 0 },
    };
    mockedApiClient.get.mockResolvedValueOnce({ data: payload });

    const result = await notesApi.listNotes({ page: 2, pageSize: 10 });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/notes', { params: { page: 2, pageSize: 10 } });
    expect(result).toEqual(payload);
  });

  it('listTrash calls GET /notes/trash with params', async () => {
    const payload = { notes: [], pagination: { page: 1, pageSize: 8, total: 0, totalPages: 1 } };
    mockedApiClient.get.mockResolvedValueOnce({ data: payload });

    const result = await notesApi.listTrash({ page: 1 });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/notes/trash', { params: { page: 1 } });
    expect(result).toEqual(payload);
  });

  it('getNote calls GET /notes/:id and unwraps the note', async () => {
    const note = { id: '1', title: 'Solo' };
    mockedApiClient.get.mockResolvedValueOnce({ data: { note } });

    const result = await notesApi.getNote('1');

    expect(mockedApiClient.get).toHaveBeenCalledWith('/notes/1');
    expect(result).toEqual(note);
  });

  it('createNote calls POST /notes and unwraps the note', async () => {
    const note = { id: '1', title: 'Test' };
    mockedApiClient.post.mockResolvedValueOnce({ data: { note } });

    const result = await notesApi.createNote({ title: 'Test' });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/notes', { title: 'Test' });
    expect(result).toEqual(note);
  });

  it('updateNote calls PATCH /notes/:id and unwraps the note', async () => {
    const note = { id: '1', title: 'Updated' };
    mockedApiClient.patch.mockResolvedValueOnce({ data: { note } });

    const result = await notesApi.updateNote('1', { title: 'Updated' });

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/notes/1', { title: 'Updated' });
    expect(result).toEqual(note);
  });

  it('deleteNote calls DELETE /notes/:id', async () => {
    mockedApiClient.delete.mockResolvedValueOnce({ data: undefined });

    await notesApi.deleteNote('1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/notes/1');
  });

  it('restoreNote calls POST /notes/:id/restore and unwraps the note', async () => {
    const note = { id: '1', deletedAt: null };
    mockedApiClient.post.mockResolvedValueOnce({ data: { note } });

    const result = await notesApi.restoreNote('1');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/notes/1/restore');
    expect(result).toEqual(note);
  });

  it('purgeNote calls DELETE /notes/:id/purge', async () => {
    mockedApiClient.delete.mockResolvedValueOnce({ data: undefined });

    await notesApi.purgeNote('1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/notes/1/purge');
  });

  it('exportNotesFile requests the given format as a blob and reads the filename from the response headers', async () => {
    const blob = new Blob(['pdf bytes']);
    mockedApiClient.get.mockResolvedValueOnce({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="notes-export-2026-01-01.pdf"' },
    });

    const result = await notesApi.exportNotesFile('pdf');

    expect(mockedApiClient.get).toHaveBeenCalledWith('/notes/export', {
      params: { format: 'pdf' },
      responseType: 'blob',
    });
    expect(result).toEqual({ blob, filename: 'notes-export-2026-01-01.pdf' });
  });

  it('exportNotesFile falls back to a generic filename when Content-Disposition is missing', async () => {
    const blob = new Blob(['txt bytes']);
    mockedApiClient.get.mockResolvedValueOnce({ data: blob, headers: {} });

    const result = await notesApi.exportNotesFile('txt');

    expect(result).toEqual({ blob, filename: 'notes-export.txt' });
  });

  it('importNotes calls POST /notes/import with the notes array', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: { imported: 2 } });

    const result = await notesApi.importNotes([{ title: 'A' }, { title: 'B' }]);

    expect(mockedApiClient.post).toHaveBeenCalledWith('/notes/import', {
      notes: [{ title: 'A' }, { title: 'B' }],
    });
    expect(result).toEqual({ imported: 2 });
  });

  it('importNoteFile posts the file as multipart form data to /notes/import/file', async () => {
    const note = { id: '1', title: 'My note' };
    mockedApiClient.post.mockResolvedValueOnce({ data: { imported: 1, note } });
    const file = new File(['hello'], 'My note.txt', { type: 'text/plain' });

    const result = await notesApi.importNoteFile(file);

    expect(mockedApiClient.post).toHaveBeenCalledWith('/notes/import/file', expect.any(FormData));
    const formData = mockedApiClient.post.mock.calls[0]?.[1] as FormData;
    expect(formData.get('file')).toBe(file);
    expect(result).toEqual({ imported: 1, note });
  });
});
