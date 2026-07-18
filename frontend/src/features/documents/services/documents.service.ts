import { apiClient } from '@/lib/api/client';
import type { ApiSuccess, Document, QueryDocumentsRequest, QueryDocumentsResponse } from '@shared/types';

/** Returns unwrapped data — never the raw ApiResponse envelope. */
export const documentsService = {
  list: (): Promise<Document[]> =>
    apiClient
      .get<ApiSuccess<Document[]>>('/documents')
      .then((r) => r.data.data),

  getById: (id: string): Promise<Document> =>
    apiClient
      .get<ApiSuccess<Document>>(`/documents/${id}`)
      .then((r) => r.data.data),

  upload: (file: File, category?: string): Promise<Document> => {
    const form = new FormData();
    form.append('file', file);
    if (category) form.append('category', category);
    return apiClient
      .post<ApiSuccess<Document>>('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data);
  },

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/documents/${id}`).then(() => undefined),

  query: (body: QueryDocumentsRequest): Promise<QueryDocumentsResponse> =>
    apiClient
      .post<ApiSuccess<QueryDocumentsResponse>>('/documents/query', body)
      .then((r) => r.data.data),
};
