import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

app.listen(env.PORT, () => {
  logger.info(`Memento API running on http://localhost:${env.PORT}`, {
    env: env.NODE_ENV,
  });
});
