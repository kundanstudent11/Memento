import { useQuery } from '@tanstack/react-query';
import { documentsService } from '../services/documents.service';

export const DOCUMENTS_QUERY_KEY = ['documents'] as const;

/** Fetches and caches the full document list. */
export function useDocuments() {
  return useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: documentsService.list,
  });
}
