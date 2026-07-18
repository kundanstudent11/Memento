import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authController } from './auth.controller';

const router = Router();

router.get('/google', authController.googleRedirect);
router.get('/google/callback', authController.googleCallback);
router.get('/me', authenticate, authController.me);
router.post('/logout', authController.logout);

export default router;
