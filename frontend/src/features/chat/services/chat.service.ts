import { apiClient } from '@/lib/api/client';
import type { ApiSuccess, AskRequest, AskResponse } from '@shared/types';

/** Returns unwrapped data — never the raw ApiResponse envelope. */
export const chatService = {
  ask: (body: AskRequest): Promise<AskResponse> =>
    apiClient.post<ApiSuccess<AskResponse>>('/ask', body).then((r) => r.data.data),
};
