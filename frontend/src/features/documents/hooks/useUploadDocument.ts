import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { documentsService } from '../services/documents.service';
import { DOCUMENTS_QUERY_KEY } from './useDocuments';

/** Uploads a document and auto-invalidates the document list on success. */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, category }: { file: File; category?: string }) =>
      documentsService.upload(file, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      toast.success('Document uploaded. AI extraction queued.');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Upload failed');
    },
  });
}
