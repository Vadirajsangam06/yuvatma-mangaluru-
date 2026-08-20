import { prisma } from '../../config/db';
import { sendEmail } from './email.service';
import { reminder24hEmail, reminder1hEmail } from './email.templates';

interface ReminderWindow {
  type: 'REMINDER_24H' | 'REMINDER_1H';
  hoursBefore: number;
  title: string;
}

const REMINDER_WINDOWS: ReminderWindow[] = [
  { type: 'REMINDER_24H', hoursBefore: 24, title: 'Event Reminder — Tomorrow' },
  { type: 'REMINDER_1H', hoursBefore: 1, title: 'Event Reminder — Starting Soon' },
];

function getEventDateTime(event: { date: Date; startTime: string }) {
  const dt = new Date(event.date);
  const [hours, minutes] = event.startTime.split(':').map(Number);
  dt.setHours(hours, minutes, 0, 0);
  return dt;
}

/**
 * Scans upcoming ACTIVE events and sends due reminders (24h / 1h before
 * start) to all invited members, respecting notifyEmail. Safe to call
 * repeatedly on an interval — dedupe is enforced per (user, event, type)
 * before any notification is created, so re-running never double-sends.
 * Never throws — any per-user failure is caught and logged so one bad
 * record can't stop the whole batch or crash the server.
 */
export async function processReminders() {
  const now = new Date();
  const lookaheadEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000); // covers both windows

  let events;
  try {
    events = await prisma.event.findMany({
      where: {
        status: 'ACTIVE',
        date: { gte: new Date(now.toDateString()), lte: lookaheadEnd },
      },
      include: { invitations: { select: { userId: true } } },
    });
  } catch (error: any) {
    console.error('[reminders] Failed to load events:', error.message);
    return;
  }

  for (const event of events) {
    const eventDateTime = getEventDateTime(event);
    if (eventDateTime <= now) continue; // already started

    for (const window of REMINDER_WINDOWS) {
      const reminderTime = new Date(eventDateTime.getTime() - window.hoursBefore * 60 * 60 * 1000);
      if (reminderTime > now) continue; // not due yet

      for (const invitation of event.invitations) {
        await sendReminderToUser(invitation.userId, event, window);
      }
    }
  }
}

async function sendReminderToUser(
  userId: string,
  event: { id: string; title: string; date: Date; startTime: string; address: string },
  window: ReminderWindow,
) {
  try {
    // Dedupe: never send the same reminder type twice for the same user/event.
    const existing = await prisma.notification.findFirst({
      where: { userId, eventId: event.id, type: window.type },
    });
    if (existing) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, notifyInApp: true, notifyEmail: true },
    });
    if (!user) return;

    const when = window.hoursBefore === 24 ? 'tomorrow' : 'in about 1 hour';
    const message = `"${event.title}" starts ${when} at ${event.startTime}, ${event.address}.`;

    // The Notification row is the dedupe ledger (see check above), so it's
    // always written; whether it counts as a "notification" the user sees
    // is controlled by notifyInApp in the same spirit as other preferences.
    await prisma.notification.create({
      data: {
        userId,
        eventId: event.id,
        type: window.type,
        title: window.title,
        message,
        status: 'SENT',
        sentAt: new Date(),
        isRead: !user.notifyInApp, // pre-mark read/hidden-from-unread-count when in-app is off
      },
    });

    if (user.notifyEmail) {
      const html = window.type === 'REMINDER_24H' ? reminder24hEmail(event) : reminder1hEmail(event);
      const subject =
        window.type === 'REMINDER_24H'
          ? `Reminder: ${event.title} is tomorrow`
          : `Reminder: ${event.title} starts soon`;
      await sendEmail({ to: user.email, subject, html });
    }
  } catch (error: any) {
    console.error(`[reminders] Failed to send reminder to user ${userId} for event ${event.id}:`, error.message);
  }
}
