import { pgTable, text, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import type { ExtractedData } from '@shared/types';

export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  googleId: text('google_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const documentStatusEnum = pgEnum('document_status', [
  'pending',
  'processing',
  'done',
  'error',
]);

export const documentCategoryEnum = pgEnum('document_category', [
  'bill',
  'prescription',
  'insurance',
  'warranty',
  'appointment',
  'other',
]);

export const documentsTable = pgTable('documents', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  originalName: text('original_name').notNull(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  category: documentCategoryEnum('category').notNull().default('other'),
  status: documentStatusEnum('status').notNull().default('pending'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  extractedData: jsonb('extracted_data').$type<ExtractedData | null>().default(null),
});
