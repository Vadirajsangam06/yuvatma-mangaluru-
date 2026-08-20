import { prisma } from '../../config/db';
import { NotificationType } from '@prisma/client';
import { sendEmail } from './email.service';
import {
  invitationEmail,
  invitationAcceptedEmail,
  invitationDeclinedEmail,
  eventUpdatedEmail,
  eventCancelledEmail,
  eventRestoredEmail,
} from './email.templates';

export async function createNotification(
  userId: string,
  eventId: string,
  type: NotificationType,
  title: string,
  message: string,
  actorName?: string,
) {
  const notification = await prisma.notification.create({
    data: { userId, eventId, type, title, message, status: 'SENT', sentAt: new Date() },
  });

  // Fire-and-forget email dispatch. Never throws — sendEmail swallows all
  // errors internally so this can never fail the caller's main operation.
  dispatchEmail(userId, eventId, type, title, actorName).catch((err) => {
    console.error('[email] dispatch error (non-blocking):', err.message);
  });

  return notification;
}

async function dispatchEmail(
  userId: string,
  eventId: string,
  type: NotificationType,
  title: string,
  actorName?: string,
) {
  const [user, event] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, notifyEmail: true } }),
    prisma.event.findUnique({
      where: { id: eventId },
      select: { title: true, date: true, startTime: true, address: true },
    }),
  ]);

  if (!user || !user.notifyEmail || !event) return; // respect preference; skip silently

  let subject = '';
  let html = '';

  switch (type) {
    case 'EVENT_INVITATION':
      subject = `You're invited: ${event.title}`;
      html = invitationEmail(actorName || 'The host', event);
      break;
    case 'INVITATION_ACCEPTED':
      subject = `${actorName || 'A member'} accepted your invitation`;
      html = invitationAcceptedEmail(actorName || 'A member', event);
      break;
    case 'INVITATION_DECLINED':
      subject = `${actorName || 'A member'} declined your invitation`;
      html = invitationDeclinedEmail(actorName || 'A member', event);
      break;
    case 'EVENT_UPDATED':
      // EVENT_UPDATED is reused for both "edit" and "restore" (Phase 6.1); title distinguishes them
      if (title === 'Event Restored') {
        subject = `Event restored: ${event.title}`;
        html = eventRestoredEmail(event);
      } else {
        subject = `Event updated: ${event.title}`;
        html = eventUpdatedEmail(event);
      }
      break;
    case 'EVENT_CANCELLED':
      subject = `Event cancelled: ${event.title}`;
      html = eventCancelledEmail(event);
      break;
    default:
      return; // No email template for this type (e.g. reminders, RSVP confirmations)
  }

  await sendEmail({ to: user.email, subject, html });
}

export async function getMyNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    include: {
      event: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) {
    throw new Error('Notification not found');
  }
  if (notification.userId !== userId) {
    throw new Error('You cannot modify this notification');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { updated: result.count };
}
