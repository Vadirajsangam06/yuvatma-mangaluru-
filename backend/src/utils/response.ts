import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'OK',
  statusCode = 200,
  meta?: Record<string, unknown>,
): void {
  const body: ApiResponse<T> = { success: true, data, message };
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  data: unknown = null,
): void {
  const body: ApiResponse = { success: false, data, message };
  res.status(statusCode).json(body);
}

// Global error handler — registered last in app.ts
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ErrorHandler]', err.message, err.stack);

  // Don't leak stack traces in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message;

  sendError(res, message, 500);
}
