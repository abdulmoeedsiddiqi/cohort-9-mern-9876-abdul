import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDeleteNote, useUpdateNote } from '../../hooks/useNotes';
import { resolveAssetUrl } from '../../lib/assetUrl';
import type { Note } from '../../types/note.types';

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function NoteCard({ note }: { note: Note }) {
  const navigate = useNavigate();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const preview = typeof note.content === 'string' ? note.content : '';
  const videoAsset = note.assets?.find((asset) => asset.kind === 'VIDEO');
  const thumbnailUrl = resolveAssetUrl(videoAsset?.thumbnailUrl);

  function togglePin() {
    setIsMenuOpen(false);
    updateNote.mutate({ id: note.id, input: { pinned: !note.pinned } });
  }

  function handleDelete() {
    setIsMenuOpen(false);
    deleteNote.mutate(note.id);
  }

  return (
    <article
      className={`note-card note-card-${note.color}`}
      onClick={() => navigate(`/notes/${note.id}`)}
    >
      <div className="note-card-header">
        <h3>{note.title}</h3>
        <div className="note-card-menu">
          {note.pinned && (
            <span className="note-card-pin" aria-label="Pinned">
              ★
            </span>
          )}
          <button
            type="button"
            className="note-card-menu-button"
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen((open) => !open);
            }}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label="Note actions"
          >
            ⋯
          </button>
          {isMenuOpen && (
            <div className="note-card-dropdown" role="menu" onClick={(event) => event.stopPropagation()}>
              <button type="button" role="menuitem" onClick={togglePin}>
                {note.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button type="button" role="menuitem" className="danger" onClick={handleDelete}>
                Move to trash
              </button>
            </div>
          )}
        </div>
      </div>

      {videoAsset && (
        <div
          className="note-card-thumbnail"
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
        >
          <span className="note-card-play" aria-hidden="true">
            ▶
          </span>
          {videoAsset.durationSec != null && (
            <span className="note-card-duration">{formatDuration(videoAsset.durationSec)}</span>
          )}
        </div>
      )}

      {preview && <p className="note-card-preview">{preview}</p>}
      {note.type !== 'TEXT' && (
        <span className="note-card-type-badge">{note.type === 'VIDEO' ? 'Video' : 'Mixed'}</span>
      )}

      <footer className="note-card-footer">Edited {formatRelativeTime(note.updatedAt)}</footer>
    </article>
  );
}
