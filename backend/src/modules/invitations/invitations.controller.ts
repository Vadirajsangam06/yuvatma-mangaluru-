import { Request, Response } from 'express';
import { sendInvitations, getMyInvitations, getEventInvitations, respondToInvitation } from './invitations.service';
import { sendInvitationsSchema, respondInvitationSchema } from './invitations.schema';
import { sendSuccess, sendError } from '../../utils/response';

export async function getEventInvitationsHandler(req: Request, res: Response) {
  try {
    const hostId = req.user?.id;
    if (!hostId) return sendError(res, 'Unauthorized', 401);

    const invitations = await getEventInvitations(req.params.id as string, hostId);
    sendSuccess(res, invitations);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
}

export async function sendInvitationsHandler(req: Request, res: Response) {
  try {
    const hostId = req.user?.id;
    if (!hostId) return sendError(res, 'Unauthorized', 401);

    const { userIds } = sendInvitationsSchema.parse(req.body);
    const result = await sendInvitations(req.params.id as string, hostId, userIds);
    sendSuccess(res, result, 'Invitations sent', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues[0].message, 400);
    }
    sendError(res, error.message, 400);
  }
}

export async function getMyInvitationsHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const invitations = await getMyInvitations(userId);
    sendSuccess(res, invitations);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}

export async function respondInvitationHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const { status } = respondInvitationSchema.parse(req.body);
    const invitation = await respondToInvitation(req.params.id as string, userId, status);
    sendSuccess(res, invitation, 'Invitation updated');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues[0].message, 400);
    }
    sendError(res, error.message, 400);
  }
}
