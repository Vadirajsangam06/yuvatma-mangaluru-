import { Router } from 'express';
import { getMyInvitationsHandler, respondInvitationHandler } from './invitations.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/mine', authenticate, getMyInvitationsHandler);
router.patch('/:id', authenticate, respondInvitationHandler);

export default router;
