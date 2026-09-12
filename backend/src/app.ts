import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, Request, Response } from 'express';

import { env } from './config/env';
import { httpLogger } from './logger/httpLogger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { authRouter } from './modules/auth/auth.routes';

export function createApp(): Express {
  const app = express();

  app.use(httpLogger);
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', env: env.nodeEnv });
  });

  app.use('/auth', authRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
