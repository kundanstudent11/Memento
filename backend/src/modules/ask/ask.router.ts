import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { askController } from './ask.controller';
import { askBodySchema } from './ask.schema';

const router = Router();

router.use(authenticate);

router.post('/', validate('body', askBodySchema), askController.ask);

export default router;
