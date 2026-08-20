import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendError } from '../utils/response';
import { AuthTokenPayload } from '../types';

// Extend Express Request to carry decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    req.user = payload;
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}

// Use after authenticate — ensures the route is only accessible to the given role
export function requireRole(role: 'ADMIN') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      sendError(res, 'Forbidden', 403);
      return;
    }
    next();
  };
}
