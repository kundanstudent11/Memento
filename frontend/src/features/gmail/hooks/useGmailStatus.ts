import { useQuery } from '@tanstack/react-query';
import { gmailService } from '../services/gmail.service';

export const GMAIL_STATUS_QUERY_KEY = ['gmail', 'status'] as const;

/** Fetches Gmail connection status for the current user. */
export function useGmailStatus() {
  return useQuery({
    queryKey: GMAIL_STATUS_QUERY_KEY,
    queryFn: gmailService.getStatus,
  });
}
