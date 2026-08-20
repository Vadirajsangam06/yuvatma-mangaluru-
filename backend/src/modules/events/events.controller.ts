import { Request, Response } from 'express';
import { createEvent, getMyEvents, getUpcomingActiveEvents, getEventById, attendEvent, updateEvent, cancelEvent, restoreEvent } from './events.service';
import { createEventSchema, updateEventSchema } from './events.schema';
import { sendSuccess, sendError } from '../../utils/response';
import { buildEventIcs } from './events.ics';
import { env } from '../../config/env';

export async function getMyEventsHandler(req: Request, res: Response) {
  try {
    const hostId = req.user?.id;
    if (!hostId) return sendError(res, 'Unauthorized', 401);

    const events = await getMyEvents(hostId);
    sendSuccess(res, events);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}

export async function listEventsHandler(_req: Request, res: Response) {
  try {
    const events = await getUpcomingActiveEvents();
    sendSuccess(res, events);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}

export async function getEventCalendarHandler(req: Request, res: Response) {
  try {
    const event = await getEventById(req.params.id as string);
    if (!event) return sendError(res, 'Event not found', 404);

    const frontendOrigin = env.CORS_ORIGINS[0];
    const icsContent = buildEventIcs({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      address: event.address,
      mapsUrl: event.mapsUrl,
      hostName: event.host.name,
      status: event.status,
      eventUrl: frontendOrigin ? `${frontendOrigin}/events/${event.id}` : undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${event.slug}.ics"`);
    res.send(icsContent);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}

export async function getEventByIdHandler(req: Request, res: Response) {
  try {
    const event = await getEventById(req.params.id as string);
    if (!event) return sendError(res, 'Event not found', 404);
    sendSuccess(res, event);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}

export async function updateEventHandler(req: Request, res: Response) {
  try {
    const hostId = req.user?.id;
    if (!hostId) return sendError(res, 'Unauthorized', 401);

    const data = updateEventSchema.parse(req.body);
    const event = await updateEvent(req.params.id as string, hostId, data);
    sendSuccess(res, event, 'Event updated successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues[0].message, 400);
    }
    sendError(res, error.message, 400);
  }
}

export async function cancelEventHandler(req: Request, res: Response) {
  try {
    const hostId = req.user?.id;
    if (!hostId) return sendError(res, 'Unauthorized', 401);

    const event = await cancelEvent(req.params.id as string, hostId);
    sendSuccess(res, event, 'Event cancelled successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
}

export async function restoreEventHandler(req: Request, res: Response) {
  try {
    const hostId = req.user?.id;
    if (!hostId) return sendError(res, 'Unauthorized', 401);

    const event = await restoreEvent(req.params.id as string, hostId);
    sendSuccess(res, event, 'Event restored successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
}

export async function attendEventHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const rsvp = await attendEvent(req.params.id as string, userId);
    sendSuccess(res, rsvp, 'You are now attending this event', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
}

export async function createEventHandler(req: Request, res: Response) {
  try {
    const hostId = req.user?.id;
    if (!hostId) return sendError(res, 'Unauthorized', 401);

    const data = createEventSchema.parse(req.body);
    const event = await createEvent(hostId, data);
    sendSuccess(res, event, 'Event created successfully', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues[0].message, 400);
    }
    sendError(res, error.message, 400);
  }
}
