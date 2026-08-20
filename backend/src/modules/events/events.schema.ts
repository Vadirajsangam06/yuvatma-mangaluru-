import { z } from 'zod';

const GOOGLE_MAPS_HOSTS = [
  'maps.google.com',
  'www.google.com',
  'google.com',
  'goo.gl',
  'maps.app.goo.gl',
];

const mapsUrlSchema = z
  .string()
  .url('Invalid Google Maps URL')
  .refine((url) => {
    try {
      const { hostname, protocol } = new URL(url);
      if (protocol !== 'https:') return false;
      return GOOGLE_MAPS_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
    } catch {
      return false;
    }
  }, 'Please paste a valid Google Maps share link (https://maps.google.com/... or https://goo.gl/...)')
  .optional()
  .or(z.literal(''));

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().uuid('Invalid category'),
  date: z.string().min(1, 'Date is required'),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format')
    .optional()
    .or(z.literal('')),
  address: z.string().min(3, 'Address is required'),
  mapsUrl: mapsUrlSchema,
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  contactNumber: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  maxAttendees: z.coerce.number().int().positive().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
