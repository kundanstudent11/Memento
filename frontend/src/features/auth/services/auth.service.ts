import { apiClient } from '@/lib/api/client';
import type { ApiSuccess, User } from '@shared/types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

/** Returns unwrapped data — never the raw ApiResponse envelope. */
export const authService = {
  getMe: (): Promise<User> =>
    apiClient.get<ApiSuccess<User>>('/auth/me').then((r) => r.data.data),

  logout: (): Promise<void> =>
    apiClient.post('/auth/logout').then(() => undefined),

  getGoogleLoginUrl: (): string => `${API_BASE}/auth/google`,
};
