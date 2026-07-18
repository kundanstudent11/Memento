import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { gmailController } from './gmail.controller';
import { listInsightsQuerySchema, syncGmailBodySchema } from './gmail.schema';

const router = Router();

router.get('/callback', gmailController.callback);

router.use(authenticate);

router.get('/connect', gmailController.connect);
router.get('/status', gmailController.status);
router.post('/sync', validate('body', syncGmailBodySchema), gmailController.sync);
router.get('/insights', validate('query', listInsightsQuerySchema), gmailController.insights);
router.get('/stats', gmailController.stats);
router.delete('/disconnect', gmailController.disconnect);

export default router;
