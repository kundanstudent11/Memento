import { v4 as uuidv4 } from 'uuid';
import type { Document, QueryDocumentsResponse } from '@shared/types';
import { NotFoundError } from '../../lib/AppError';
import { logger } from '../../lib/logger';
import { documentsRepository } from './documents.repository';
import type { UploadDocumentBody, ListDocumentsQuery, QueryDocumentsBody } from './documents.schema';

export const documentsService = {
  async list(userId: string, query: ListDocumentsQuery): Promise<{ items: Document[]; total: number }> {
    return documentsRepository.findAll(userId, query);
  },

  async getById(userId: string, id: string): Promise<Document> {
    const doc = await documentsRepository.findById(userId, id);
    if (!doc) throw new NotFoundError(`Document not found: ${id}`);
    return doc;
  },

  async create(userId: string, file: Express.Multer.File, body: UploadDocumentBody): Promise<Document> {
    const now = new Date();
    const doc = await documentsRepository.create({
      id: uuidv4(),
      userId,
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      category: body.category ?? 'other',
      status: 'pending',
      uploadedAt: now,
      updatedAt: now,
      extractedData: null,
    });
    logger.info('Document created', { id: doc.id, name: doc.originalName });

    // TODO: enqueue AI extraction job here
    return doc;
  },

  async delete(userId: string, id: string): Promise<void> {
    const deleted = await documentsRepository.delete(userId, id);
    if (!deleted) throw new NotFoundError(`Document not found: ${id}`);
    logger.info('Document deleted', { id });
  },

  async query(userId: string, body: QueryDocumentsBody): Promise<QueryDocumentsResponse> {
    logger.info('Document query received', { userId, question: body.question });

    // TODO: replace stub with real LLM + RAG pipeline
    return {
      question: body.question,
      answer: 'AI reasoning across your documents is coming soon.',
      sourceDocs: [],
    };
  },
};
