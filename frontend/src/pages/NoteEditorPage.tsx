import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ThemeToggle } from '../components/common/ThemeToggle';
import { useCreateNote, useNote, useUpdateNote } from '../hooks/useNotes';
import type { NoteType } from '../types/note.types';

const COLORS: { value: string; label: string }[] = [
  { value: 'yellow', label: 'Yellow' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
];

const TYPES: { value: NoteType; label: string }[] = [
  { value: 'TEXT', label: 'Text' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'MIXED', label: 'Mixed' },
];

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: existingNote, isLoading } = useNote(id);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('TEXT');
  const [color, setColor] = useState('yellow');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(typeof existingNote.content === 'string' ? existingNote.content : '');
      setType(existingNote.type);
      setColor(existingNote.color);
    }
  }, [existingNote]);

  const isSaving = createNote.isPending || updateNote.isPending;

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Give your note a title before saving.');
      return;
    }

    try {
      if (isEditing && id) {
        await updateNote.mutateAsync({ id, input: { title, content, type, color } });
        navigate(`/notes/${id}`);
      } else {
        const note = await createNote.mutateAsync({ title, content, type, color });
        navigate(`/notes/${note.id}`);
      }
    } catch {
      setError('Could not save your note. Please try again.');
    }
  }

  if (isEditing && isLoading) {
    return <p className="notes-page-status">Loading note…</p>;
  }

  return (
    <div className="note-editor-page">
      <header className="topbar">
        <button type="button" className="note-editor-back" onClick={() => navigate('/notes')}>
          ← Back to notes
        </button>
        <div className="topbar-actions">
          <ThemeToggle />
          <button type="button" className="note-editor-cancel" onClick={() => navigate('/notes')}>
            Cancel
          </button>
          <button type="submit" form="note-editor-form" className="note-editor-save" disabled={isSaving}>
            {isSaving ? 'Saving…' : '✓ Save note'}
          </button>
        </div>
      </header>

      <form id="note-editor-form" className="note-editor-card" onSubmit={handleSave}>
        <input
          className="note-editor-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Untitled note"
        />

        <div className="note-editor-type-tabs" role="tablist">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={type === t.value}
              className={type === t.value ? 'active' : ''}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {type !== 'VIDEO' && (
          <textarea
            className="note-editor-textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Start writing…"
            rows={10}
          />
        )}

        {type !== 'TEXT' && (
          <div className="note-editor-video-placeholder">
            <p>Video recording is coming soon.</p>
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}

        <div className="note-editor-footer">
          <div className="note-editor-colors">
            <span>Color</span>
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.label}
                aria-pressed={color === c.value}
                className={`note-editor-color-swatch note-editor-color-${c.value}${
                  color === c.value ? ' selected' : ''
                }`}
                onClick={() => setColor(c.value)}
              />
            ))}
          </div>
          <span className="note-editor-word-count">{countWords(content)} words</span>
        </div>
      </form>
    </div>
  );
}
