import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import * as notesApi from '../../api/notes.api';
import { Sidebar } from './Sidebar';

jest.mock('../../api/notes.api', () => ({
  listNotes: jest.fn(),
  exportNotes: jest.fn(),
  importNotes: jest.fn(),
}));
const mockedNotesApi = notesApi as jest.Mocked<typeof notesApi>;

const mockedDownloadJson = jest.fn();
jest.mock('../../lib/downloadFile', () => ({
  downloadJson: (filename: string, data: unknown) => mockedDownloadJson(filename, data),
}));

const basePayload = {
  notes: [],
  pagination: { page: 1, pageSize: 8, total: 0, totalPages: 1 },
  counts: { all: 3, pinned: 1, video: 0, trash: 0 },
};

function renderSidebar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function makeFile(content: unknown, name = 'export.json') {
  return new File([JSON.stringify(content)], name, { type: 'application/json' });
}

describe('Sidebar', () => {
  beforeEach(() => {
    mockedNotesApi.listNotes.mockResolvedValue(basePayload);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows sidebar counts once notes load', async () => {
    renderSidebar();
    expect(await screen.findByText('3')).toBeInTheDocument();
  });

  it('exports notes and triggers a download on click', async () => {
    const exportPayload = { exportedAt: '2026-01-01T00:00:00.000Z', notes: [] };
    mockedNotesApi.exportNotes.mockResolvedValueOnce(exportPayload);
    const user = userEvent.setup();
    renderSidebar();

    await user.click(await screen.findByText('Export notes'));

    await waitFor(() => expect(mockedNotesApi.exportNotes).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockedDownloadJson).toHaveBeenCalledWith(expect.stringMatching(/^notes-export-.*\.json$/), exportPayload),
    );
  });

  it('imports a valid export file and shows how many notes were imported', async () => {
    mockedNotesApi.importNotes.mockResolvedValueOnce({ imported: 2 });
    const user = userEvent.setup();
    renderSidebar();

    const file = makeFile({ notes: [{ title: 'A' }, { title: 'B' }] });
    const input = document.querySelector('.sidebar-file-input') as HTMLInputElement;
    await user.upload(input, file);

    expect(await screen.findByText('Imported 2 notes.')).toBeInTheDocument();
    expect(mockedNotesApi.importNotes.mock.calls[0]?.[0]).toEqual([{ title: 'A' }, { title: 'B' }]);
  });

  it('shows an error for a file with no notes', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const file = makeFile({ notes: [] });
    const input = document.querySelector('.sidebar-file-input') as HTMLInputElement;
    await user.upload(input, file);

    expect(await screen.findByText('That file has no notes to import.')).toBeInTheDocument();
    expect(mockedNotesApi.importNotes).not.toHaveBeenCalled();
  });

  it('shows an error for a file that is not valid JSON', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const file = new File(['not json'], 'bad.json', { type: 'application/json' });
    const input = document.querySelector('.sidebar-file-input') as HTMLInputElement;
    await user.upload(input, file);

    expect(await screen.findByText("Couldn't import that file. Make sure it's a notes export.")).toBeInTheDocument();
  });
});
