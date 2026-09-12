import { useNavigate } from 'react-router-dom';

import type { Note } from '../../types/note.types';
import { NoteCard } from './NoteCard';

export function NoteGrid({ notes }: { notes: Note[] }) {
  const navigate = useNavigate();

  if (notes.length === 0) {
    return (
      <div className="note-grid-empty">
        <p>No notes yet.</p>
        <button type="button" className="note-grid-empty-cta" onClick={() => navigate('/notes/new')}>
          + Create your first note
        </button>
      </div>
    );
  }

  const pinned = notes.filter((note) => note.pinned);
  const rest = notes.filter((note) => !note.pinned);

  return (
    <div className="note-grid-sections">
      {pinned.length > 0 && (
        <section>
          <h2 className="note-grid-section-title">Pinned</h2>
          <div className="note-grid">
            {pinned.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}

      <section>
        {pinned.length > 0 && <h2 className="note-grid-section-title">All notes</h2>}
        <div className="note-grid">
          {rest.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
          <button type="button" className="note-card note-card-new" onClick={() => navigate('/notes/new')}>
            <span className="note-card-new-icon">+</span>
            New note
          </button>
        </div>
      </section>
    </div>
  );
}
