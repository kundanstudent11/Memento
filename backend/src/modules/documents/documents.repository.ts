import { and, asc, count, desc, eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { documentsTable } from '../../lib/db/schema';
import type { Document, DocumentCategory, DocumentStatus, ExtractedData } from '@shared/types';
import type { ListDocumentsQuery } from './documents.schema';

type DocumentRow = typeof documentsTable.$inferSelect;
type DocumentInsert = typeof documentsTable.$inferInsert;

const SORT_COLUMNS = {
  uploadedAt: documentsTable.uploadedAt,
  originalName: documentsTable.originalName,
} as const;

function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    originalName: row.originalName,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    category: row.category as DocumentCategory,
    status: row.status as DocumentStatus,
    uploadedAt: row.uploadedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    extractedData: (row.extractedData as ExtractedData) ?? null,
  };
}

export const documentsRepository = {
  /**
   * Returns a paginated, filtered, sorted list of documents and the total count.
   */
  async findAll(
    userId: string,
    query: ListDocumentsQuery
  ): Promise<{ items: Document[]; total: number }> {
    const conditions = [eq(documentsTable.userId, userId)];
    if (query.category) conditions.push(eq(documentsTable.category, query.category));
    if (query.status) conditions.push(eq(documentsTable.status, query.status));
    const where = and(...conditions);

    const sortCol = SORT_COLUMNS[query.sort] ?? documentsTable.uploadedAt;
    const order = query.order === 'asc' ? asc(sortCol) : desc(sortCol);
    const offset = (query.page - 1) * query.perPage;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(documentsTable)
        .where(where)
        .orderBy(order)
        .limit(query.perPage)
        .offset(offset),
      db.select({ value: count() }).from(documentsTable).where(where),
    ]);

    return { items: rows.map(toDocument), total: Number(totals[0]?.value ?? 0) };
  },

  /**
   * Finds a single document by ID, returns null if not found.
   */
  async findById(userId: string, id: string): Promise<Document | null> {
    const [row] = await db
      .select()
      .from(documentsTable)
      .where(and(eq(documentsTable.id, id), eq(documentsTable.userId, userId)));
    return row ? toDocument(row) : null;
  },

  /**
   * Inserts a new document row and returns the created document.
   */
  async create(data: DocumentInsert): Promise<Document> {
    const [row] = await db.insert(documentsTable).values(data).returning();
    return toDocument(row);
  },

  /**
   * Deletes a document by ID. Returns true if a row was deleted.
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const deleted = await db
      .delete(documentsTable)
      .where(and(eq(documentsTable.id, id), eq(documentsTable.userId, userId)))
      .returning({ id: documentsTable.id });
    return deleted.length > 0;
  },
};
