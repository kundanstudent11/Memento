import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { gmailConnectionsTable } from '../../lib/db/schema';

export type GmailConnectionRow = typeof gmailConnectionsTable.$inferSelect;
export type NewGmailConnection = typeof gmailConnectionsTable.$inferInsert;

export const gmailConnectionRepository = {
  async findByUserId(userId: string): Promise<GmailConnectionRow | null> {
    const rows = await db
      .select()
      .from(gmailConnectionsTable)
      .where(eq(gmailConnectionsTable.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  },

  async upsert(data: NewGmailConnection): Promise<GmailConnectionRow> {
    const existing = await this.findByUserId(data.userId);
    if (existing) {
      const rows = await db
        .update(gmailConnectionsTable)
        .set({
          googleEmail: data.googleEmail,
          refreshTokenEncrypted: data.refreshTokenEncrypted,
          scopes: data.scopes,
          status: data.status,
          connectedAt: data.connectedAt,
          updatedAt: data.updatedAt,
        })
        .where(eq(gmailConnectionsTable.userId, data.userId))
        .returning();
      const updated = rows[0];
      if (!updated) throw new Error('Failed to update gmail connection');
      return updated;
    }

    const rows = await db.insert(gmailConnectionsTable).values(data).returning();
    const created = rows[0];
    if (!created) throw new Error('Failed to create gmail connection');
    return created;
  },

  async updateLastSyncedAt(userId: string, lastSyncedAt: Date): Promise<void> {
    await db
      .update(gmailConnectionsTable)
      .set({ lastSyncedAt, updatedAt: new Date() })
      .where(eq(gmailConnectionsTable.userId, userId));
  },

  async deleteByUserId(userId: string): Promise<void> {
    await db.delete(gmailConnectionsTable).where(eq(gmailConnectionsTable.userId, userId));
  },
};
