import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(7, 'Invalid phone number').optional().or(z.literal('')),
  profileImage: z.string().url('Invalid image URL').optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePreferencesSchema = z.object({
  notifyInApp: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
  notifyWhatsapp: z.boolean().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
