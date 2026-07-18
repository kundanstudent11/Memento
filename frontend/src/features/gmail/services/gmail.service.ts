import { apiClient } from '@/lib/api/client';
import type {
  ApiSuccess,
  GmailConnection,
  GmailInsight,
  GmailStats,
  GmailSyncRequest,
  GmailSyncResult,
} from '@shared/types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

/** Returns unwrapped data — never the raw ApiResponse envelope. */
export const gmailService = {
  getConnectUrl: (): string => `${API_BASE}/gmail/connect`,

  getStatus: (): Promise<GmailConnection> =>
    apiClient.get<ApiSuccess<GmailConnection>>('/gmail/status').then((r) => r.data.data),

  sync: (body: GmailSyncRequest = {}): Promise<GmailSyncResult> =>
    apiClient
      .post<ApiSuccess<GmailSyncResult>>('/gmail/sync', body)
      .then((r) => r.data.data),

  getStats: (): Promise<GmailStats> =>
    apiClient.get<ApiSuccess<GmailStats>>('/gmail/stats').then((r) => r.data.data),

  listInsights: (): Promise<GmailInsight[]> =>
    apiClient
      .get<ApiSuccess<GmailInsight[]>>('/gmail/insights')
      .then((r) => r.data.data),

  disconnect: (): Promise<void> =>
    apiClient.delete('/gmail/disconnect').then(() => undefined),
};
