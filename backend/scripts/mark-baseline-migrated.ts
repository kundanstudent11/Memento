import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import postgres from 'postgres';

/**
 * One-time operational script: marks existing baseline migration(s) as
 * already applied against a database that was previously provisioned via
 * `drizzle-kit push` (schema exists, but drizzle's migration history doesn't).
 *
 * Replicates drizzle-orm's postgres-js migrator tracking exactly (schema
 * `drizzle`, table `__drizzle_migrations`, sha256 hash of the raw .sql file)
 * so that `npm run db:migrate` recognizes already-applied migrations and
 * skips re-running their CREATE TABLE statements.
 */

const MIGRATIONS_FOLDER = path.resolve(__dirname, '../drizzle');

type JournalEntry = { tag: string; when: number };

async function main(): Promise<void> {
  const journalPath = path.join(MIGRATIONS_FOLDER, 'meta/_journal.json');
  if (!existsSync(journalPath)) {
    throw new Error(`No migrations journal found at ${journalPath}`);
  }
  const journal = JSON.parse(readFileSync(journalPath, 'utf-8')) as {
    entries: JournalEntry[];
  };

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required (check backend/.env)');
  }

  const isLocalDb = /^(localhost|127\.0\.0\.1|::1)$/.test(new URL(databaseUrl).hostname);
  const sql = postgres(databaseUrl, { ssl: isLocalDb ? false : { rejectUnauthorized: false } });

  try {
    await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
    await sql`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `;

    for (const entry of journal.entries) {
      const filePath = path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`);
      const content = readFileSync(filePath, 'utf-8');
      const hash = createHash('sha256').update(content).digest('hex');

      const existing = await sql`
        SELECT id FROM drizzle.__drizzle_migrations WHERE hash = ${hash}
      `;
      if (existing.length > 0) {
        console.log(`Already marked as applied: ${entry.tag}`);
        continue;
      }

      await sql`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES (${hash}, ${entry.when})
      `;
      console.log(`Marked as applied: ${entry.tag}`);
    }
  } finally {
    await sql.end();
  }
}

main().catch((err: unknown) => {
  console.error('Failed to mark baseline as migrated:', err);
  process.exit(1);
});
