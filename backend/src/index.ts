import { createApp } from './app';
import { env } from './config/env';
import { logger } from './logger';

const app = createApp();

app.listen(env.port, () => {
  logger.info(`Backend listening on port ${env.port} [${env.nodeEnv}]`);
});
