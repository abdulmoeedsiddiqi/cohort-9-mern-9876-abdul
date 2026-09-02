import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

import { ThemeToggle } from '../components/common/ThemeToggle';
import { AiSummaryPanel } from '../components/editor/AiSummaryPanel';
import { TiptapEditor } from '../components/editor/TiptapEditor';
import type { RecordedVideo } from '../components/notes/VideoRecorder';
import { VideoRecorder } from '../components/notes/VideoRecorder';
import {
  useCreateNote,
  useNote,
  useSummarizeNote,
  useUpdateNote,
  useUploadVideoAsset,
} from '../hooks/useNotes';
import { resolveAssetUrl } from '../lib/assetUrl';
import { countWords, extractPlainText } from '../lib/tiptapText';
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

function toEditorContent(raw: unknown): string | object | null {
  if (typeof raw === 'string') {
    return raw;
  }
  if (raw && typeof raw === 'object') {
    return raw as object;
  }
  return null;
}

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: existingNote, isLoading } = useNote(id);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const uploadVideoAsset = useUploadVideoAsset();
  const summarizeNote = useSummarizeNote();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<unknown>(undefined);
  const [wordCount, setWordCount] = useState(0);
  const [type, setType] = useState<NoteType>('TEXT');
  const [color, setColor] = useState('yellow');
  const [recordedVideo, setRecordedVideo] = useState<RecordedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryDismissed, setIsSummaryDismissed] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setType(existingNote.type);
      setColor(existingNote.color);
      const plainText =
        typeof existingNote.content === 'string'
          ? existingNote.content
          : extractPlainText(existingNote.content);
      setWordCount(countWords(plainText));
      setSummary(existingNote.summary);
      setIsSummaryDismissed(false);
    }
  }, [existingNote]);

  async function handleSummarize() {
    if (!id) {
      return;
    }
    setSummaryError(null);
    try {
      const updated = await summarizeNote.mutateAsync(id);
      setSummary(updated.summary);
      setIsSummaryDismissed(false);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } } | undefined)?.error?.message
        : undefined;
      setSummaryError(message ?? 'Could not generate a summary right now. Please try again.');
    }
  }

  const isSaving = createNote.isPending || updateNote.isPending || uploadVideoAsset.isPending;

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Give your note a title before saving.');
      return;
    }

    try {
      const noteId = isEditing && id
        ? (await updateNote.mutateAsync({ id, input: { title, content, type, color } })).id
        : (await createNote.mutateAsync({ title, content, type, color })).id;

      if (recordedVideo) {
        await uploadVideoAsset.mutateAsync({
          noteId,
          input: {
            video: recordedVideo.blob,
            thumbnail: recordedVideo.thumbnailBlob,
            durationSec: recordedVideo.durationSec,
          },
        });
      }

      navigate('/notes');
    } catch {
      setError('Could not save your note. Please try again.');
    }
  }

  if (isEditing && isLoading) {
    return <p className="notes-page-status">Loading note…</p>;
  }

  const existingVideoAsset = existingNote?.assets?.[0];

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
          <TiptapEditor
            content={toEditorContent(existingNote?.content)}
            onUpdate={(json, count) => {
              setContent(json);
              setWordCount(count);
            }}
            toolbarEnd={
              isEditing && (
                <button
                  type="button"
                  className="summarize-button"
                  onClick={() => {
                    void handleSummarize();
                  }}
                  disabled={summarizeNote.isPending}
                >
                  <span aria-hidden="true">✦</span> {summarizeNote.isPending ? 'Summarizing…' : 'Summarize'}
                </button>
              )
            }
          />
        )}

        {summary && !isSummaryDismissed && (
          <AiSummaryPanel
            summary={summary}
            isRegenerating={summarizeNote.isPending}
            onRegenerate={() => {
              void handleSummarize();
            }}
            onDismiss={() => setIsSummaryDismissed(true)}
          />
        )}
        {summaryError && <p className="ai-summary-panel-error">{summaryError}</p>}

        {type !== 'TEXT' && (
          <VideoRecorder onRecorded={setRecordedVideo} existingAssetUrl={resolveAssetUrl(existingVideoAsset?.url)} />
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
          <span className="note-editor-word-count">{wordCount} words</span>
        </div>
      </form>
    </div>
  );
}
