import { useQuery } from '@tanstack/react-query';
import { gmailService } from '../services/gmail.service';

export const GMAIL_STATS_QUERY_KEY = ['gmail', 'stats'] as const;

/** Fetches aggregated Gmail dashboard stats. */
export function useGmailStats(enabled = true) {
  return useQuery({
    queryKey: GMAIL_STATS_QUERY_KEY,
    queryFn: gmailService.getStats,
    enabled,
  });
}
