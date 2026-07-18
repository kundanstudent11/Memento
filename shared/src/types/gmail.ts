/**
 * Gmail connect / extract / stats contract.
 * Keep this file type-only (string unions, no enums/const/Zod) so
 * backend and frontend can deploy independently without runtime shared deps.
 */

export type GmailItemType =
  | 'subscription'
  | 'bill'
  | 'receipt'
  | 'statement'
  | 'insurance'
  | 'warranty'
  | 'appointment'
  | 'refund'
  | 'other';

export type SpendingCategory =
  | 'streaming'
  | 'software'
  | 'utilities'
  | 'telecom'
  | 'insurance'
  | 'healthcare'
  | 'shopping'
  | 'food'
  | 'transport'
  | 'housing'
  | 'finance'
  | 'education'
  | 'travel'
  | 'other';

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly' | 'one_time';

export type ReminderKind = 'due' | 'renewal' | 'expiry' | 'appointment' | 'custom';

export type GmailConnectionStatus = 'connected' | 'revoked' | 'error';

export type GmailInsightStatus = 'active' | 'paid' | 'cancelled' | 'expired' | 'upcoming' | 'unknown';

export type GmailSender = {
  name: string | null;
  email: string;
};

export type GmailMerchant = {
  name: string;
  domain: string | null;
};

export type GmailAmount = {
  value: number;
  currency: string;
};

export type GmailDates = {
  issuedAt: string | null;
  paidAt: string | null;
  dueDate: string | null;
  renewalDate: string | null;
  serviceDate: string | null;
};

export type GmailReminder = {
  kind: ReminderKind;
  date: string;
  label: string;
};

export type GmailSource = {
  gmailMessageId: string;
  gmailThreadId: string;
  subject: string;
  from: GmailSender;
  receivedAt: string;
};

/** One extracted item as returned by the LLM. */
export type GmailExtractionItem = {
  source: GmailSource;
  type: GmailItemType;
  category: SpendingCategory;
  title: string;
  merchant: GmailMerchant | null;
  amount: GmailAmount | null;
  billingCycle: BillingCycle | null;
  dates: GmailDates;
  status: GmailInsightStatus;
  reminders: GmailReminder[];
  summary: string;
  keyTerms: string[];
  confidence: number;
  details: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

/** Full LLM response for a batch of emails. */
export type GmailExtractionResult = {
  schemaVersion: '1.0';
  items: GmailExtractionItem[];
};

/** Persisted insight returned by the API. */
export type GmailInsight = {
  id: string;
  type: GmailItemType;
  category: SpendingCategory;
  title: string;
  merchant: GmailMerchant | null;
  amount: GmailAmount | null;
  billingCycle: BillingCycle | null;
  dates: GmailDates;
  status: GmailInsightStatus;
  summary: string;
  keyTerms: string[];
  reminders: GmailReminder[];
  details: Record<string, unknown>;
  metadata: Record<string, unknown>;
  source: GmailSource;
  confidence: number;
  createdAt: string;
  updatedAt: string;
};

export type GmailConnection = {
  connected: boolean;
  status: GmailConnectionStatus | null;
  googleEmail: string | null;
  connectedAt: string | null;
  lastSyncedAt: string | null;
};

export type GmailSyncRequest = {
  windowDays?: number;
};

export type GmailSyncResult = {
  emailsScanned: number;
  itemsExtracted: number;
  itemsStored: number;
  durationMs: number;
};

export type GmailSpendByCategory = {
  category: SpendingCategory;
  total: number;
  currency: string;
  count: number;
};

export type GmailTopMerchant = {
  name: string;
  domain: string | null;
  total: number;
  currency: string;
  count: number;
};

export type GmailSubscriptionSummary = {
  id: string;
  title: string;
  merchant: GmailMerchant | null;
  amount: GmailAmount | null;
  billingCycle: BillingCycle | null;
  renewalDate: string | null;
  status: GmailInsightStatus;
};

export type GmailUpcomingReminder = {
  insightId: string;
  kind: ReminderKind;
  date: string;
  label: string;
  title: string;
};

export type GmailStats = {
  totalsByType: Partial<Record<GmailItemType, number>>;
  totalItems: number;
  monthlyRecurringTotal: number;
  currency: string;
  spendByCategory: GmailSpendByCategory[];
  topMerchants: GmailTopMerchant[];
  subscriptions: GmailSubscriptionSummary[];
  upcomingReminders: GmailUpcomingReminder[];
  lastSyncedAt: string | null;
};

export type ListGmailInsightsQuery = {
  page?: number;
  perPage?: number;
  type?: GmailItemType;
  category?: SpendingCategory;
};
