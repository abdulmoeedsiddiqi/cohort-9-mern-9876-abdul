import { usePurgeNote, useRestoreNote } from '../../hooks/useNotes';
import { resolveAssetUrl } from '../../lib/assetUrl';
import { formatDuration, formatRelativeTime } from '../../lib/noteCardFormat';
import type { Note } from '../../types/note.types';

export function TrashCard({ note }: { note: Note }) {
  const restoreNote = useRestoreNote();
  const purgeNote = usePurgeNote();

  const preview = typeof note.content === 'string' ? note.content : '';
  const videoAsset = note.assets?.find((asset) => asset.kind === 'VIDEO');
  const thumbnailUrl = resolveAssetUrl(videoAsset?.thumbnailUrl);

  function handleRestore() {
    restoreNote.mutate(note.id);
  }

  function handlePurge() {
    if (window.confirm(`Permanently delete "${note.title}"? This can't be undone.`)) {
      purgeNote.mutate(note.id);
    }
  }

  return (
    <article className={`note-card note-card-${note.color} note-card-trashed`}>
      <div className="note-card-header">
        <h3>{note.title}</h3>
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

      <footer className="note-card-footer">
        <span>Deleted {formatRelativeTime(note.deletedAt ?? note.updatedAt)}</span>
        <div className="note-card-trash-actions">
          <button type="button" onClick={handleRestore} disabled={restoreNote.isPending}>
            Restore
          </button>
          <button type="button" className="danger" onClick={handlePurge} disabled={purgeNote.isPending}>
            Delete forever
          </button>
        </div>
      </footer>
    </article>
  );
}
