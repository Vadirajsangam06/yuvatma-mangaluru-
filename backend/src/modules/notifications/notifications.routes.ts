import { Router } from 'express';
import {
  getMyNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
} from './notifications.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getMyNotificationsHandler);
router.patch('/read-all', authenticate, markAllNotificationsReadHandler);
router.patch('/:id/read', authenticate, markNotificationReadHandler);

export default router;
