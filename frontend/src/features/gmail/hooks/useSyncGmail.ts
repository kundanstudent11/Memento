import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { gmailService } from '../services/gmail.service';
import { GMAIL_STATUS_QUERY_KEY } from './useGmailStatus';
import { GMAIL_STATS_QUERY_KEY } from './useGmailStats';
import type { GmailSyncRequest } from '@shared/types';

/** Triggers a blocking Gmail sync and refreshes status/stats caches. */
export function useSyncGmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body?: GmailSyncRequest) => gmailService.sync(body ?? {}),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: GMAIL_STATUS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: GMAIL_STATS_QUERY_KEY });
      toast.success(
        `Synced ${result.emailsScanned} emails · ${result.itemsStored} items saved`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gmail sync failed');
    },
  });
}
