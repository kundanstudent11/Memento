import { Router } from 'express';
import { documentsController } from './documents.controller';
import { upload } from '../../middleware/upload';
import { validate } from '../../middleware/validate';
import {
  uploadDocumentBodySchema,
  queryDocumentsSchema,
  listDocumentsQuerySchema,
} from './documents.schema';

const router = Router();

router.get('/', validate('query', listDocumentsQuerySchema), documentsController.list);
router.get('/:id', documentsController.getById);
router.post(
  '/upload',
  upload.single('file'),
  validate('body', uploadDocumentBodySchema),
  documentsController.upload
);
router.post('/query', validate('body', queryDocumentsSchema), documentsController.query);
router.delete('/:id', documentsController.delete);

export default router;
