import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { ApiError } from '../utils/ApiError';

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      cb(new Error('Only video files are allowed'));
      return;
    }
    cb(null, true);
  },
}).single('video');

export function uploadVideo(req: Request, res: Response, next: NextFunction): void {
  uploader(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError) {
      next(ApiError.badRequest(`Upload error: ${err.message}`));
      return;
    }
    next(ApiError.badRequest(err instanceof Error ? err.message : 'Invalid upload'));
  });
}
