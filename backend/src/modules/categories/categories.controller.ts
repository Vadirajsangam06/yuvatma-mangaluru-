import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';

export async function getAllCategoriesHandler(_req: Request, res: Response) {
  try {
    const categories = await prisma.eventCategory.findMany({
      orderBy: { order: 'asc' },
    });
    sendSuccess(res, categories);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}
