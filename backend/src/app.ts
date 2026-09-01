import express, { Express, Request, Response } from 'express';

import { env } from './config/env';
import { httpLogger } from './logger/httpLogger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

export function createApp(): Express {
  const app = express();

  app.use(httpLogger);
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', env: env.nodeEnv });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
