import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { documentsService } from '../services/documents.service';
import { DOCUMENTS_QUERY_KEY } from './useDocuments';

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      toast.success('Document deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Delete failed');
    },
  });
}
