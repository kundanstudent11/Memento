import { z } from 'zod';

export const documentCategorySchema = z.enum([
  'bill',
  'prescription',
  'insurance',
  'warranty',
  'appointment',
  'other',
]);

/** Extra fields submitted alongside the file in multipart/form-data */
export const uploadDocumentBodySchema = z.object({
  category: documentCategorySchema.optional().default('other'),
  description: z.string().max(500).optional(),
});

/** POST /documents/query */
export const queryDocumentsSchema = z.object({
  question: z.string().min(1, 'question is required').max(1000),
  documentIds: z.array(z.string().uuid()).optional(),
});

/** GET /documents — list query params */
export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  category: documentCategorySchema.optional(),
  status: z.enum(['pending', 'processing', 'done', 'error']).optional(),
  sort: z.enum(['uploadedAt', 'originalName']).default('uploadedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type UploadDocumentBody = z.infer<typeof uploadDocumentBodySchema>;
export type QueryDocumentsBody = z.infer<typeof queryDocumentsSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
