import { Request, Response } from 'express';

import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { JWT_EXPIRES_IN_SECONDS } from '../../utils/jwt';
import * as authService from './auth.service';
import { loginSchema, signupSchema } from './auth.validation';

function setAuthCookie(res: Response, token: string): void {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: JWT_EXPIRES_IN_SECONDS * 1000,
    path: '/',
  });
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest('Invalid signup details', parsed.error.flatten().fieldErrors);
  }

  const { user, token } = await authService.signup(parsed.data);
  setAuthCookie(res, token);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest('Invalid login details', parsed.error.flatten().fieldErrors);
  }

  const { user, token } = await authService.login(parsed.data);
  setAuthCookie(res, token);
  res.status(200).json({ user });
});
