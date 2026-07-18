import { Router } from 'express';
import { documentsRouter } from '../modules/documents';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    name: 'Memento API',
    version: '1.0.0',
    description: 'AI-powered document intelligence',
  });
});

router.use('/documents', documentsRouter);

export default router;
