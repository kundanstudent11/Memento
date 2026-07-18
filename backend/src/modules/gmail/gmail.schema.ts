import { z } from 'zod';

export const syncGmailBodySchema = z.object({
  windowDays: z.coerce.number().int().min(1).max(365).optional(),
});

export type SyncGmailBody = z.infer<typeof syncGmailBodySchema>;

export const listInsightsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  type: z
    .enum([
      'subscription',
      'bill',
      'receipt',
      'statement',
      'insurance',
      'warranty',
      'appointment',
      'refund',
      'other',
    ])
    .optional(),
  category: z
    .enum([
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
    ])
    .optional(),
});

export type ListInsightsQuery = z.infer<typeof listInsightsQuerySchema>;

export const gmailSenderSchema = z.object({
  name: z.string().nullable(),
  email: z.string(),
});

export const gmailMerchantSchema = z
  .object({
    name: z.string(),
    domain: z.string().nullable(),
  })
  .nullable();

export const gmailAmountSchema = z
  .object({
    value: z.number(),
    currency: z.string().min(1),
  })
  .nullable();

export const gmailDatesSchema = z.object({
  issuedAt: z.string().nullable(),
  paidAt: z.string().nullable(),
  dueDate: z.string().nullable(),
  renewalDate: z.string().nullable(),
  serviceDate: z.string().nullable(),
});

export const gmailReminderSchema = z.object({
  kind: z.enum(['due', 'renewal', 'expiry', 'appointment', 'custom']),
  date: z.string(),
  label: z.string(),
});

export const gmailSourceSchema = z.object({
  gmailMessageId: z.string().min(1),
  gmailThreadId: z.string().min(1),
  subject: z.string(),
  from: gmailSenderSchema,
  receivedAt: z.string(),
});

export const gmailExtractionItemSchema = z.object({
  source: gmailSourceSchema,
  type: z.enum([
    'subscription',
    'bill',
    'receipt',
    'statement',
    'insurance',
    'warranty',
    'appointment',
    'refund',
    'other',
  ]),
  category: z.enum([
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
  ]),
  title: z.string().min(1),
  merchant: gmailMerchantSchema,
  amount: gmailAmountSchema,
  billingCycle: z
    .enum(['monthly', 'yearly', 'weekly', 'quarterly', 'one_time'])
    .nullable(),
  dates: gmailDatesSchema,
  status: z.enum(['active', 'paid', 'cancelled', 'expired', 'upcoming', 'unknown']),
  reminders: z.array(gmailReminderSchema),
  summary: z.string(),
  keyTerms: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  details: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
});

export const gmailExtractionResultSchema = z.object({
  schemaVersion: z.literal('1.0').or(z.string()),
  items: z.array(gmailExtractionItemSchema),
});
