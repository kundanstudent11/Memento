import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

async function start(): Promise<void> {

  app.listen(env.PORT, () => {
    logger.info(`Memento API running on http://localhost:${env.PORT}`, {
      env: env.NODE_ENV,
    });
  });
}

start().catch((err: unknown) => {
  logger.error('Failed to start server', { err });
  process.exit(1);
});
