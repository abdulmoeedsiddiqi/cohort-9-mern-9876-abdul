import express, { Express, Request, Response } from 'express';

import { env } from './config/env';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', env: env.nodeEnv });
  });

  return app;
}
