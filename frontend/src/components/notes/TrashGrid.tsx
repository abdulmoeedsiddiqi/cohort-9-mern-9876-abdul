import type { Note } from '../../types/note.types';
import { TrashCard } from './TrashCard';

export function TrashGrid({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="note-grid-empty">
        <p>Trash is empty.</p>
      </div>
    );
  }

  return (
    <div className="note-grid">
      {notes.map((note) => (
        <TrashCard key={note.id} note={note} />
      ))}
    </div>
  );
}
