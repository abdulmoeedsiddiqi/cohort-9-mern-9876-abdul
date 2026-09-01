import { z } from 'zod';

export const NOTE_COLORS = ['yellow', 'blue', 'green', 'purple', 'pink', 'orange', 'red'] as const;
const NOTE_TYPES = ['TEXT', 'VIDEO', 'MIXED'] as const;

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.unknown().optional(),
  type: z.enum(NOTE_TYPES).optional(),
  color: z.enum(NOTE_COLORS).optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200).optional(),
  content: z.unknown().optional(),
  type: z.enum(NOTE_TYPES).optional(),
  color: z.enum(NOTE_COLORS).optional(),
  pinned: z.boolean().optional(),
});

export const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(8),
});
