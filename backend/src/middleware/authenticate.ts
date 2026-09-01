import { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[env.cookieName] as string | undefined;
  if (!token) {
    next(ApiError.unauthorized('Authentication required'));
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired session'));
  }
}
