import { Request, Response } from 'express';

import { getPublicPath } from '../../lib/storage';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import * as notesAssetsService from './notes-assets.service';

export const upload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No video file provided');
  }

  const asset = await notesAssetsService.addVideoAsset(req.user!.id, req.params.id, {
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  res.status(201).json({ asset: { ...asset, url: getPublicPath(asset.filePath) } });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await notesAssetsService.removeVideoAsset(req.user!.id, req.params.id, req.params.assetId);
  res.status(204).send();
});
