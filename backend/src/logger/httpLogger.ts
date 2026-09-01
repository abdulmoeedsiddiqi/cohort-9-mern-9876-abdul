import { randomUUID } from 'crypto';

import pinoHttp from 'pino-http';

import { logger } from './index';

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers['x-request-id'];
    const id = typeof existing === 'string' ? existing : randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
