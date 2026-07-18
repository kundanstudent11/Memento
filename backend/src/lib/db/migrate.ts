import { sql } from 'drizzle-orm';
import { db } from './index';
import { logger } from '../logger';

/**
 * Creates required enums and tables if they don't already exist.
 * Runs on every startup — safe to re-run (all statements are idempotent).
 */
export async function runStartupMigration(): Promise<void> {
  logger.info('Running startup schema migration…');

  // Enums must be created before the table that references them.
  // Using DO/EXCEPTION so it's safe to re-run.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE document_status AS ENUM ('pending', 'processing', 'done', 'error');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE document_category AS ENUM ('bill', 'prescription', 'insurance', 'warranty', 'appointment', 'other');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS documents (
      id            TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      filename      TEXT NOT NULL,
      mime_type     TEXT NOT NULL,
      size_bytes    INTEGER NOT NULL,
      category      document_category NOT NULL DEFAULT 'other',
      status        document_status   NOT NULL DEFAULT 'pending',
      uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      extracted_data JSONB DEFAULT NULL
    );
  `);

  logger.info('Schema migration complete');
}
