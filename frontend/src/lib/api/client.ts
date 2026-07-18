import axios from 'axios';
import type { ApiError } from '@shared/types';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/**
 * Unwrap envelope errors so React Query catches them as proper Error instances.
 * The error message comes from the structured API error code/message.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (err) => {
    const data = err.response?.data as ApiError | undefined;
    const message = data?.error?.message ?? err.message ?? 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
