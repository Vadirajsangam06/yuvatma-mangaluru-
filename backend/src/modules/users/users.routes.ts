import { Router } from 'express';
import { getMeHandler, searchUsersHandler, updateProfileHandler, getPreferencesHandler, updatePreferencesHandler } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/me', authenticate, getMeHandler);
router.patch('/me', authenticate, updateProfileHandler);
router.get('/me/preferences', authenticate, getPreferencesHandler);
router.patch('/me/preferences', authenticate, updatePreferencesHandler);
router.get('/search', authenticate, searchUsersHandler);

export default router;
