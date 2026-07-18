/**
 * Document domain types — single source of truth for both backend and frontend.
 */

export type DocumentStatus = 'pending' | 'processing' | 'done' | 'error';

export type DocumentCategory =
  | 'bill'
  | 'prescription'
  | 'insurance'
  | 'warranty'
  | 'appointment'
  | 'other';

export type Document = {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  category: DocumentCategory;
  status: DocumentStatus;
  uploadedAt: string; // ISO-8601
  updatedAt: string;  // ISO-8601
  extractedData: ExtractedData | null;
};

export type ExtractedData = {
  type: string;
  provider?: string;
  amount?: number;
  currency?: string;
  dueDate?: string;     // ISO-8601 date string
  renewalDate?: string; // ISO-8601 date string
  summary: string;
  keyTerms: string[];
  confidence: number;   // 0-1 AI confidence score
};

// ---------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------

/** POST /documents/upload — extra form fields alongside the file */
export type UploadDocumentBody = {
  category?: DocumentCategory;
  description?: string;
};

/** POST /documents/query */
export type QueryDocumentsRequest = {
  question: string;
  /** Optionally scope to specific document IDs */
  documentIds?: string[];
};

/** POST /documents/query — response data */
export type QueryDocumentsResponse = {
  question: string;
  answer: string;
  sourceDocs: Pick<Document, 'id' | 'originalName' | 'category'>[];
  tokensUsed?: number;
};
