import { prisma } from '../../config/db';
import { createNotification } from '../notifications/notifications.service';

const invitationInclude = {
  event: {
    include: {
      category: true,
      host: { select: { id: true, name: true, profileImage: true } },
    },
  },
} as const;

export async function sendInvitations(eventId: string, hostId: string, userIds: string[]) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { host: { select: { id: true, name: true } } },
  });
  if (!event) {
    throw new Error('Event not found');
  }
  if (event.hostId !== hostId) {
    throw new Error('Only the event host can invite members');
  }
  if (event.status !== 'ACTIVE') {
    throw new Error('Cannot invite members to an inactive or cancelled event');
  }

  // Never invite the host to their own event
  const requestedIds = [...new Set(userIds)].filter((id) => id !== hostId);

  // Only notify users who don't already have an invitation to this event
  const existing = await prisma.invitation.findMany({
    where: { eventId, userId: { in: requestedIds } },
    select: { userId: true },
  });
  const existingIds = new Set(existing.map((e) => e.userId));
  const newIds = requestedIds.filter((id) => !existingIds.has(id));

  const result = await prisma.invitation.createMany({
    data: requestedIds.map((userId) => ({ eventId, userId, invitedById: hostId })),
    skipDuplicates: true, // relies on @@unique([eventId, userId])
  });

  await Promise.all(
    newIds.map((userId) =>
      createNotification(
        userId,
        eventId,
        'EVENT_INVITATION',
        'New Event Invitation',
        `${event.host.name} invited you to "${event.title}"`,
        event.host.name,
      ),
    ),
  );

  return { invited: result.count, requested: requestedIds.length };
}

export async function getMyInvitations(userId: string) {
  return prisma.invitation.findMany({
    where: { userId },
    include: invitationInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEventInvitations(eventId: string, hostId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new Error('Event not found');
  }
  if (event.hostId !== hostId) {
    throw new Error('Only the event host can view this event\'s invitees');
  }

  return prisma.invitation.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true, profileImage: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function respondToInvitation(
  invitationId: string,
  userId: string,
  status: 'ACCEPTED' | 'DECLINED',
) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
    },
  });
  if (!invitation) {
    throw new Error('Invitation not found');
  }
  if (invitation.userId !== userId) {
    throw new Error('You cannot respond to this invitation');
  }

  const updated = await prisma.invitation.update({
    where: { id: invitationId },
    data: { status },
    include: invitationInclude,
  });

  await createNotification(
    invitation.invitedById,
    invitation.eventId,
    status === 'ACCEPTED' ? 'INVITATION_ACCEPTED' : 'INVITATION_DECLINED',
    status === 'ACCEPTED' ? 'Invitation Accepted' : 'Invitation Declined',
    `${invitation.user.name} ${status === 'ACCEPTED' ? 'accepted' : 'declined'} your invitation to "${invitation.event.title}"`,
    invitation.user.name,
  );

  return updated;
}
