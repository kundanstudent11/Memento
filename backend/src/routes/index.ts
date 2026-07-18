import { Router } from 'express';
import { documentsRouter } from '../modules/documents';
import { authRouter } from '../modules/auth';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    name: 'Memento API',
    version: '1.0.0',
    description: 'AI-powered document intelligence',
  });
});

router.use('/auth', authRouter);
router.use('/documents', documentsRouter);

export default router;
