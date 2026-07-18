import { Type, type Schema } from '../../lib/llm';

export const GMAIL_EXTRACTION_SYSTEM_PROMPT = `You are Memento's email analysis engine. You receive a batch of raw emails
belonging to one user. Extract ONLY financially or administratively relevant
records: subscriptions, bills, receipts, statements, insurance, warranties,
appointments, and refunds.

Rules:
- Return ONE item per distinct relevant record found. One email may yield zero,
  one, or multiple items.
- IGNORE newsletters, promotions, social, personal, and OTP/security emails.
  If an email contains nothing relevant, produce no item for it.
- NEVER invent values. If a field is unknown, use null. Do not guess amounts,
  dates, or merchants.
- Normalize all dates to ISO-8601 (YYYY-MM-DD or full ISO datetime for receivedAt).
- Normalize currency to ISO-4217 codes (e.g. USD, EUR, INR).
- Set confidence (0-1) reflecting how certain the extraction is.
- Use type, category, and billingCycle ONLY from the allowed enum values.
- Put type-specific extras in details and nothing else outside the schema.
- Copy source.gmailMessageId and source.gmailThreadId exactly from the input.
- Output MUST match the provided JSON schema exactly.
- Return {"schemaVersion":"1.0","items":[]} if nothing is relevant.`;

const senderSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, nullable: true },
    email: { type: Type.STRING },
  },
  required: ['name', 'email'],
};

const merchantSchema: Schema = {
  type: Type.OBJECT,
  nullable: true,
  properties: {
    name: { type: Type.STRING },
    domain: { type: Type.STRING, nullable: true },
  },
  required: ['name', 'domain'],
};

const amountSchema: Schema = {
  type: Type.OBJECT,
  nullable: true,
  properties: {
    value: { type: Type.NUMBER },
    currency: { type: Type.STRING },
  },
  required: ['value', 'currency'],
};

const datesSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    issuedAt: { type: Type.STRING, nullable: true },
    paidAt: { type: Type.STRING, nullable: true },
    dueDate: { type: Type.STRING, nullable: true },
    renewalDate: { type: Type.STRING, nullable: true },
    serviceDate: { type: Type.STRING, nullable: true },
  },
  required: ['issuedAt', 'paidAt', 'dueDate', 'renewalDate', 'serviceDate'],
};

const reminderSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    kind: {
      type: Type.STRING,
      enum: ['due', 'renewal', 'expiry', 'appointment', 'custom'],
    },
    date: { type: Type.STRING },
    label: { type: Type.STRING },
  },
  required: ['kind', 'date', 'label'],
};

const sourceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    gmailMessageId: { type: Type.STRING },
    gmailThreadId: { type: Type.STRING },
    subject: { type: Type.STRING },
    from: senderSchema,
    receivedAt: { type: Type.STRING },
  },
  required: ['gmailMessageId', 'gmailThreadId', 'subject', 'from', 'receivedAt'],
};

const itemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    source: sourceSchema,
    type: {
      type: Type.STRING,
      enum: [
        'subscription',
        'bill',
        'receipt',
        'statement',
        'insurance',
        'warranty',
        'appointment',
        'refund',
        'other',
      ],
    },
    category: {
      type: Type.STRING,
      enum: [
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
      ],
    },
    title: { type: Type.STRING },
    merchant: merchantSchema,
    amount: amountSchema,
    billingCycle: {
      type: Type.STRING,
      nullable: true,
      enum: ['monthly', 'yearly', 'weekly', 'quarterly', 'one_time'],
    },
    dates: datesSchema,
    status: {
      type: Type.STRING,
      enum: ['active', 'paid', 'cancelled', 'expired', 'upcoming', 'unknown'],
    },
    reminders: { type: Type.ARRAY, items: reminderSchema },
    summary: { type: Type.STRING },
    keyTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
    confidence: { type: Type.NUMBER },
    details: { type: Type.OBJECT, properties: {} },
    metadata: { type: Type.OBJECT, properties: {} },
  },
  required: [
    'source',
    'type',
    'category',
    'title',
    'merchant',
    'amount',
    'billingCycle',
    'dates',
    'status',
    'reminders',
    'summary',
    'keyTerms',
    'confidence',
    'details',
    'metadata',
  ],
};

export const GMAIL_EXTRACTION_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    schemaVersion: { type: Type.STRING },
    items: { type: Type.ARRAY, items: itemSchema },
  },
  required: ['schemaVersion', 'items'],
};
