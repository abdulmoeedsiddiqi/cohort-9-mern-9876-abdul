import { Request, Response } from 'express';

import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { toAssetResponse } from './notes-assets.controller';
import * as notesService from './notes.service';
import { createNoteSchema, listNotesQuerySchema, updateNoteSchema } from './notes.validation';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listNotesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw ApiError.badRequest('Invalid query parameters', parsed.error.flatten().fieldErrors);
  }

  const result = await notesService.listNotes(req.user!.id, parsed.data.page, parsed.data.pageSize);
  res.status(200).json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest('Invalid note details', parsed.error.flatten().fieldErrors);
  }

  const note = await notesService.createNote(req.user!.id, parsed.data);
  res.status(201).json({ note });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const note = await notesService.getNote(req.user!.id, req.params.id);
  res.status(200).json({ note: { ...note, assets: note.assets.map(toAssetResponse) } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest('Invalid note details', parsed.error.flatten().fieldErrors);
  }

  const note = await notesService.updateNote(req.user!.id, req.params.id, parsed.data);
  res.status(200).json({ note });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await notesService.softDeleteNote(req.user!.id, req.params.id);
  res.status(204).send();
});

export const listTrash = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listNotesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw ApiError.badRequest('Invalid query parameters', parsed.error.flatten().fieldErrors);
  }

  const result = await notesService.listTrash(req.user!.id, parsed.data.page, parsed.data.pageSize);
  res.status(200).json(result);
});

export const restore = asyncHandler(async (req: Request, res: Response) => {
  const note = await notesService.restoreNote(req.user!.id, req.params.id);
  res.status(200).json({ note });
});

export const purge = asyncHandler(async (req: Request, res: Response) => {
  await notesService.purgeNote(req.user!.id, req.params.id);
  res.status(204).send();
});
