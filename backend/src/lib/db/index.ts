import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../config/env';
import * as schema from './schema';

// Render (and most hosted Postgres) require SSL on external connections.
// Local Postgres typically has SSL disabled, so forcing it breaks local dev.
const isLocalDb = /^(localhost|127\.0\.0\.1|::1)$/.test(new URL(env.DATABASE_URL).hostname);

const client = postgres(env.DATABASE_URL, {
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

export const db = drizzle(client, { schema });
