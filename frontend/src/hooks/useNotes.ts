import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as notesApi from '../api/notes.api';

const NOTES_ROOT_KEY = ['notes'] as const;
const notesKey = (params: notesApi.ListNotesParams) => [...NOTES_ROOT_KEY, 'list', params] as const;
const trashKey = (params: notesApi.ListNotesParams) => [...NOTES_ROOT_KEY, 'trash', params] as const;
const noteKey = (id: string) => [...NOTES_ROOT_KEY, 'detail', id] as const;

export function useNotes(params: notesApi.ListNotesParams = {}) {
  return useQuery({
    queryKey: notesKey(params),
    queryFn: () => notesApi.listNotes(params),
  });
}

export function useTrash(params: notesApi.ListNotesParams = {}) {
  return useQuery({
    queryKey: trashKey(params),
    queryFn: () => notesApi.listTrash(params),
  });
}

export function useNote(id: string | undefined) {
  return useQuery({
    queryKey: noteKey(id ?? ''),
    queryFn: () => notesApi.getNote(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateNotes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: NOTES_ROOT_KEY });
}

export function useCreateNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: notesApi.createNote,
    onSuccess: invalidate,
  });
}

export function useUpdateNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: notesApi.UpdateNoteInput }) =>
      notesApi.updateNote(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: notesApi.deleteNote,
    onSuccess: invalidate,
  });
}

export function useRestoreNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: notesApi.restoreNote,
    onSuccess: invalidate,
  });
}

export function usePurgeNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: notesApi.purgeNote,
    onSuccess: invalidate,
  });
}

export function useSummarizeNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: (input: string | { id: string; content?: unknown }) =>
      typeof input === 'string'
        ? notesApi.summarizeNote(input)
        : notesApi.summarizeNote(input.id, input.content),
    onSuccess: invalidate,
  });
}

export function useExportNotes() {
  return useMutation({ mutationFn: notesApi.exportNotesFile });
}

export function useImportNotes() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: notesApi.importNotes,
    onSuccess: invalidate,
  });
}

export function useImportNoteFile() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: notesApi.importNoteFile,
    onSuccess: invalidate,
  });
}

export function useUploadVideoAsset() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: ({ noteId, input }: { noteId: string; input: notesApi.UploadVideoAssetInput }) =>
      notesApi.uploadVideoAsset(noteId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteVideoAsset() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: ({ noteId, assetId }: { noteId: string; assetId: string }) =>
      notesApi.deleteVideoAsset(noteId, assetId),
    onSuccess: invalidate,
  });
}
