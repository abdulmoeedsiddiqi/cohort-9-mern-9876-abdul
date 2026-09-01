import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export interface AuthTokenPayload {
  sub: string;
}

export const JWT_EXPIRES_IN_SECONDS = env.jwtExpiresInDays * 24 * 60 * 60;

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRES_IN_SECONDS });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}
