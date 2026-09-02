import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { NavLink } from 'react-router-dom';

import type { ImportNoteInput } from '../../api/notes.api';
import { useExportNotes, useImportNotes, useNotes } from '../../hooks/useNotes';
import { downloadJson } from '../../lib/downloadFile';

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  all: 'M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5',
  pinned: 'M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.7L12 16.9 5.8 20.2l1.6-6.7L2.2 8.9l6.9-.6z',
  video: 'M15 8l6-3v14l-6-3M3 6h12v12H3z',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
  export: 'M12 3v10 M8 9l4 4 4-4 M5 21h14',
  import: 'M12 21V11 M8 15l4-4 4 4 M5 3h14',
};

export function Sidebar() {
  const { data } = useNotes();
  const counts = data?.counts;
  const exportNotes = useExportNotes();
  const importNotes = useImportNotes();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const items = [
    { to: '/notes', label: 'All notes', count: counts?.all, icon: ICONS.all, end: true },
    { to: '/notes/pinned', label: 'Pinned', count: counts?.pinned, icon: ICONS.pinned, end: false },
    { to: '/notes/video', label: 'Video notes', count: counts?.video, icon: ICONS.video, end: false },
    { to: '/notes/trash', label: 'Trash', count: counts?.trash, icon: ICONS.trash, end: false },
  ];

  async function handleExport() {
    setImportStatus(null);
    try {
      const result = await exportNotes.mutateAsync();
      downloadJson(`notes-export-${new Date().toISOString().slice(0, 10)}.json`, result);
    } catch {
      setImportStatus("Couldn't export notes. Please try again.");
    }
  }

  function handleImportClick() {
    setImportStatus(null);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { notes?: ImportNoteInput[] };
      if (!Array.isArray(parsed.notes) || parsed.notes.length === 0) {
        setImportStatus('That file has no notes to import.');
        return;
      }

      const result = await importNotes.mutateAsync(parsed.notes);
      setImportStatus(`Imported ${result.imported} note${result.imported === 1 ? '' : 's'}.`);
    } catch {
      setImportStatus("Couldn't import that file. Make sure it's a notes export.");
    }
  }

  return (
    <nav className="sidebar" aria-label="Notes navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <span className="sidebar-link-label">
            <NavIcon path={item.icon} />
            {item.label}
          </span>
          <span className="sidebar-count">{item.count ?? '–'}</span>
        </NavLink>
      ))}

      <div className="sidebar-secondary">
        <button
          type="button"
          className="sidebar-link sidebar-action"
          onClick={handleExport}
          disabled={exportNotes.isPending}
        >
          <span className="sidebar-link-label">
            <NavIcon path={ICONS.export} />
            {exportNotes.isPending ? 'Exporting…' : 'Export notes'}
          </span>
        </button>
        <button
          type="button"
          className="sidebar-link sidebar-action"
          onClick={handleImportClick}
          disabled={importNotes.isPending}
        >
          <span className="sidebar-link-label">
            <NavIcon path={ICONS.import} />
            {importNotes.isPending ? 'Importing…' : 'Import notes'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="sidebar-file-input"
          aria-label="Import notes file"
          onChange={(event) => {
            void handleFileSelected(event);
          }}
        />
        {importStatus && <p className="sidebar-import-status">{importStatus}</p>}
      </div>
    </nav>
  );
}
