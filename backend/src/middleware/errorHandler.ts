import { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

interface ErrorResponseBody {
  error: {
    message: string;
    requestId?: string;
    details?: unknown;
    stack?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const apiError = err instanceof ApiError ? err : ApiError.internal('Internal server error');

  req.log?.error({ err, isOperational: apiError.isOperational }, apiError.message);

  const body: ErrorResponseBody = {
    error: {
      message: apiError.message,
      requestId: req.id as string | undefined,
    },
  };

  if (err instanceof ApiError && err.details !== undefined) {
    body.error.details = err.details;
  }

  if (env.nodeEnv === 'development' && err instanceof Error) {
    body.error.stack = err.stack;
  }

  res.status(apiError.statusCode).json(body);
}
