import { z } from 'zod';

export const sendInvitationsSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'Select at least one member to invite'),
});

export type SendInvitationsInput = z.infer<typeof sendInvitationsSchema>;

export const respondInvitationSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED']),
});

export type RespondInvitationInput = z.infer<typeof respondInvitationSchema>;
