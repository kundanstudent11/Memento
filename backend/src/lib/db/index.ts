import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../config/env';
import * as schema from './schema';

// Render (and most hosted Postgres) require SSL on external connections.
// rejectUnauthorized: false trusts Render's self-signed cert chain.
const client = postgres(env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(client, { schema });
