import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  numeric,
  uniqueIndex,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import type { ExtractedData, GmailExtractionItem } from '@shared/types';

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

export const gmailConnectionStatusEnum = pgEnum('gmail_connection_status', [
  'connected',
  'revoked',
  'error',
]);

export const gmailItemTypeEnum = pgEnum('gmail_item_type', [
  'subscription',
  'bill',
  'receipt',
  'statement',
  'insurance',
  'warranty',
  'appointment',
  'refund',
  'other',
]);

export const spendingCategoryEnum = pgEnum('spending_category', [
  'streaming',
  'software',
  'utilities',
  'telecom',
  'insurance',
  'healthcare',
  'shopping',
  'food',
  'transport',
  'housing',
  'finance',
  'education',
  'travel',
  'other',
]);

export const billingCycleEnum = pgEnum('billing_cycle', [
  'monthly',
  'yearly',
  'weekly',
  'quarterly',
  'one_time',
]);

export const gmailInsightStatusEnum = pgEnum('gmail_insight_status', [
  'active',
  'paid',
  'cancelled',
  'expired',
  'upcoming',
  'unknown',
]);

export const gmailConnectionsTable = pgTable('gmail_connections', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  googleEmail: text('google_email').notNull(),
  refreshTokenEncrypted: text('refresh_token_encrypted').notNull(),
  scopes: text('scopes').notNull(),
  status: gmailConnectionStatusEnum('status').notNull().default('connected'),
  connectedAt: timestamp('connected_at', { withTimezone: true }).notNull().defaultNow(),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const gmailInsightsTable = pgTable(
  'gmail_insights',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    gmailMessageId: text('gmail_message_id').notNull(),
    gmailThreadId: text('gmail_thread_id').notNull(),
    fingerprint: text('fingerprint').notNull(),
    type: gmailItemTypeEnum('type').notNull(),
    category: spendingCategoryEnum('category').notNull(),
    title: text('title').notNull(),
    merchantName: text('merchant_name'),
    merchantDomain: text('merchant_domain'),
    amountValue: numeric('amount_value', { precision: 12, scale: 2 }),
    currency: text('currency'),
    billingCycle: billingCycleEnum('billing_cycle'),
    issuedAt: text('issued_at'),
    paidAt: text('paid_at'),
    dueDate: text('due_date'),
    renewalDate: text('renewal_date'),
    serviceDate: text('service_date'),
    status: gmailInsightStatusEnum('status').notNull().default('unknown'),
    summary: text('summary').notNull(),
    confidence: doublePrecision('confidence').notNull(),
    raw: jsonb('raw').$type<GmailExtractionItem>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('gmail_insights_user_message_fingerprint_uidx').on(
      table.userId,
      table.gmailMessageId,
      table.fingerprint
    ),
  ]
);
