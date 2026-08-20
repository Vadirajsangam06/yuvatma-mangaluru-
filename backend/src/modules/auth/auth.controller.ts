import { Request, Response } from 'express';
import { register, login } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { sendSuccess, sendError } from '../../utils/response';

export async function registerHandler(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await register(data);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.errors[0].message, 400);
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
      return sendError(res, error.errors[0].message, 400);
    }
    sendError(res, error.message, 401);
  }
}
