import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';
import { updateProfileSchema, updatePreferencesSchema } from './users.schema';

export async function getMeHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return sendError(res, 'User not found', 404);

    const { passwordHash: _, ...userWithoutPassword } = user;
    sendSuccess(res, userWithoutPassword);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}

export async function searchUsersHandler(req: Request, res: Response) {
  try {
    const currentUserId = req.user?.id;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) return sendSuccess(res, []);

    const users = await prisma.user.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
        id: { not: currentUserId },
      },
      select: { id: true, name: true, profileImage: true },
      take: 20,
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, users);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}

export async function updateProfileHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const data = updateProfileSchema.parse(req.body);
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.profileImage !== undefined) updateData.profileImage = data.profileImage || null;
    if (data.bio !== undefined) updateData.bio = data.bio || null;
    if (data.location !== undefined) updateData.location = data.location || null;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    sendSuccess(res, userWithoutPassword, 'Profile updated successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues[0].message, 400);
    }
    if (error.code === 'P2002') {
      return sendError(res, 'That email is already in use', 400);
    }
    sendError(res, error.message, 400);
  }
}

export async function getPreferencesHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notifyInApp: true, notifyEmail: true, notifyWhatsapp: true },
    });
    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}

export async function updatePreferencesHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const data = updatePreferencesSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { notifyInApp: true, notifyEmail: true, notifyWhatsapp: true },
    });

    sendSuccess(res, user, 'Preferences updated successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues[0].message, 400);
    }
    sendError(res, error.message, 400);
  }
}
