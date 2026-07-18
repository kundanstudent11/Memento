import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { usersTable } from '../../lib/db/schema';
import type { User } from '@shared/types';

type UserRow = typeof usersTable.$inferSelect;
type UserInsert = typeof usersTable.$inferInsert;

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

export const authRepository = {
  async findById(id: string): Promise<User | null> {
    const [row] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return row ? toUser(row) : null;
  },

  async findByGoogleId(googleId: string): Promise<User | null> {
    const [row] = await db.select().from(usersTable).where(eq(usersTable.googleId, googleId));
    return row ? toUser(row) : null;
  },

  async upsert(data: UserInsert): Promise<User> {
    const [row] = await db
      .insert(usersTable)
      .values(data)
      .onConflictDoUpdate({
        target: usersTable.googleId,
        set: {
          email: data.email,
          name: data.name,
          avatarUrl: data.avatarUrl,
          updatedAt: data.updatedAt,
        },
      })
      .returning();
    return toUser(row);
  },
};
