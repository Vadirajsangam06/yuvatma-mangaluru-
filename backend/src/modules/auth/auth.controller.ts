import { Request, Response } from 'express';
import { register, login, forgotPassword, resetPassword, changePassword } from './auth.service';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schema';
import { sendSuccess, sendError } from '../../utils/response';

export async function registerHandler(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await register(data);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues?.[0]?.message || error.errors?.[0]?.message || 'Invalid input', 400);
    }
    sendError(res, error.message, 400);
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await login(data);
    sendSuccess(res, result, 'Login successful');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues?.[0]?.message || error.errors?.[0]?.message || 'Invalid input', 400);
    }
    sendError(res, error.message, 401);
  }
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await forgotPassword(data);
    sendSuccess(res, result, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues?.[0]?.message || error.errors?.[0]?.message || 'Invalid input', 400);
    }
    sendError(res, error.message, 400);
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(data);
    sendSuccess(res, result, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues?.[0]?.message || error.errors?.[0]?.message || 'Invalid input', 400);
    }
    sendError(res, error.message, 400);
  }
}

export async function changePasswordHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const data = changePasswordSchema.parse(req.body);
    const result = await changePassword(userId, data);
    sendSuccess(res, result, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.issues?.[0]?.message || error.errors?.[0]?.message || 'Invalid input', 400);
    }
    sendError(res, error.message, 400);
  }
}

