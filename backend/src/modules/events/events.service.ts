import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/db';
import { CreateEventInput, UpdateEventInput } from './events.schema';
import { createNotification } from '../notifications/notifications.service';

const eventInclude = {
  category: true,
  host: { select: { id: true, name: true, profileImage: true } },
} as const;

export async function createEvent(hostId: string, data: CreateEventInput) {
  const category = await prisma.eventCategory.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new Error('Category not found');
  }

  const baseSlug = slugify(data.title, { lower: true, strict: true });
  const slug = `${baseSlug}-${uuidv4().slice(0, 8)}`;

  const event = await prisma.event.create({
    data: {
      slug,
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime || undefined,
      address: data.address,
      mapsUrl: data.mapsUrl || undefined,
      latitude: data.latitude,
      longitude: data.longitude,
      contactNumber: data.contactNumber || undefined,
      imageUrl: data.imageUrl || undefined,
      visibility: data.visibility,
      maxAttendees: data.maxAttendees,
      hostId,
      categoryId: data.categoryId,
    },
    include: {
      category: true,
      host: { select: { id: true, name: true, profileImage: true } },
    },
  });

  return event;
}

export async function getMyEvents(hostId: string) {
  return prisma.event.findMany({
    where: { hostId },
    include: eventInclude,
    orderBy: { date: 'desc' },
  });
}

export async function getUpcomingActiveEvents() {
  return prisma.event.findMany({
    where: {
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      date: { gte: new Date(new Date().toDateString()) },
    },
    include: eventInclude,
    orderBy: { date: 'asc' },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: eventInclude,
  });
}

async function notifyInvitees(
  eventId: string,
  eventTitle: string,
  type: 'EVENT_UPDATED' | 'EVENT_CANCELLED',
  title: string,
  message: string,
) {
  const invitations = await prisma.invitation.findMany({
    where: { eventId },
    select: { userId: true },
  });
  await Promise.all(
    invitations.map((inv) => createNotification(inv.userId, eventId, type, title, message)),
  );
}

export async function updateEvent(eventId: string, hostId: string, data: UpdateEventInput) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) {
    throw new Error('Event not found');
  }
  if (existing.hostId !== hostId) {
    throw new Error('Only the event host can edit this event');
  }
  if (existing.status !== 'ACTIVE') {
    throw new Error('Cannot edit an inactive or cancelled event');
  }

  if (data.categoryId) {
    const category = await prisma.eventCategory.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new Error('Category not found');
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime || undefined }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.mapsUrl !== undefined && { mapsUrl: data.mapsUrl || null }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.contactNumber !== undefined && { contactNumber: data.contactNumber || undefined }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || undefined }),
      ...(data.visibility !== undefined && { visibility: data.visibility }),
      ...(data.maxAttendees !== undefined && { maxAttendees: data.maxAttendees }),
    },
    include: eventInclude,
  });

  await notifyInvitees(
    eventId,
    updated.title,
    'EVENT_UPDATED',
    'Event Updated',
    `"${updated.title}" has been updated by the host. Check the latest details.`,
  );

  return updated;
}

export async function cancelEvent(eventId: string, hostId: string) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) {
    throw new Error('Event not found');
  }
  if (existing.hostId !== hostId) {
    throw new Error('Only the event host can cancel this event');
  }
  if (existing.status === 'CANCELLED') {
    throw new Error('Event is already cancelled');
  }

  const cancelled = await prisma.event.update({
    where: { id: eventId },
    data: { status: 'CANCELLED' },
    include: eventInclude,
  });

  await notifyInvitees(
    eventId,
    cancelled.title,
    'EVENT_CANCELLED',
    'Event Cancelled',
    `"${cancelled.title}" has been cancelled by the host.`,
  );

  return cancelled;
}

export async function restoreEvent(eventId: string, hostId: string) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) {
    throw new Error('Event not found');
  }
  if (existing.hostId !== hostId) {
    throw new Error('Only the event host can restore this event');
  }
  if (existing.status !== 'CANCELLED') {
    throw new Error('Only cancelled events can be restored');
  }

  const restored = await prisma.event.update({
    where: { id: eventId },
    data: { status: 'ACTIVE' },
    include: eventInclude,
  });

  await notifyInvitees(
    eventId,
    restored.title,
    'EVENT_UPDATED',
    'Event Restored',
    `"${restored.title}" has been restored and is active again. Date: ${restored.date.toDateString()} at ${restored.startTime}.`,
  );

  return restored;
}

export async function attendEvent(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new Error('Event not found');
  }
  if (event.status !== 'ACTIVE') {
    throw new Error('This event is not open for attendance');
  }
  if (event.hostId === userId) {
    throw new Error('Hosts are automatically attending their own event');
  }

  const existing = await prisma.rsvp.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (existing && existing.status === 'CONFIRMED') {
    throw new Error('You are already attending this event');
  }

  const [rsvp] = await prisma.$transaction([
    existing
      ? prisma.rsvp.update({
          where: { eventId_userId: { eventId, userId } },
          data: { status: 'CONFIRMED' },
        })
      : prisma.rsvp.create({
          data: { eventId, userId, status: 'CONFIRMED' },
        }),
    prisma.event.update({
      where: { id: eventId },
      data: { rsvpCount: { increment: 1 } },
    }),
  ]);

  return rsvp;
}
