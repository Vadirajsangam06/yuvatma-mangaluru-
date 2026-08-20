import { Router } from 'express';
import { createEventHandler, getMyEventsHandler, listEventsHandler, getEventByIdHandler, getEventCalendarHandler, attendEventHandler, updateEventHandler, cancelEventHandler, restoreEventHandler } from './events.controller';
import { sendInvitationsHandler, getEventInvitationsHandler } from '../invitations/invitations.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/mine', authenticate, getMyEventsHandler);
router.get('/', listEventsHandler);
router.get('/:id', getEventByIdHandler);
router.get('/:id/calendar.ics', getEventCalendarHandler);
router.patch('/:id', authenticate, updateEventHandler);
router.post('/:id/cancel', authenticate, cancelEventHandler);
router.post('/:id/restore', authenticate, restoreEventHandler);
router.post('/:id/attend', authenticate, attendEventHandler);
router.post('/:id/invite', authenticate, sendInvitationsHandler);
router.get('/:id/invitations', authenticate, getEventInvitationsHandler);
router.post('/', authenticate, createEventHandler);

export default router;
