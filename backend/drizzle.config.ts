import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

// Append ?sslmode=require so drizzle-kit connects with SSL to Render Postgres.
// The app client handles SSL separately via the postgres-js ssl option.
const rawUrl = process.env['DATABASE_URL'] ?? '';
const dbUrl = rawUrl.includes('?') ? rawUrl : `${rawUrl}?sslmode=require`;

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
});
