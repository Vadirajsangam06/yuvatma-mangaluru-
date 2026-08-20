import { Request, Response } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from './notifications.service';
import { sendSuccess, sendError } from '../../utils/response';

export async function getMyNotificationsHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const notifications = await getMyNotifications(userId);
    sendSuccess(res, notifications);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}

export async function markNotificationReadHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const notification = await markAsRead(req.params.id, userId);
    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
}

export async function markAllNotificationsReadHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const result = await markAllAsRead(userId);
    sendSuccess(res, result, 'All notifications marked as read');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}
