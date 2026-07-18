import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { gmailService } from '../services/gmail.service';
import { GMAIL_STATUS_QUERY_KEY } from './useGmailStatus';
import { GMAIL_STATS_QUERY_KEY } from './useGmailStats';

/** Disconnects Gmail and clears related caches. */
export function useDisconnectGmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gmailService.disconnect,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GMAIL_STATUS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: GMAIL_STATS_QUERY_KEY });
      toast.success('Gmail disconnected');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to disconnect Gmail');
    },
  });
}
