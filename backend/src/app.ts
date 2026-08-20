import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './utils/response';

import authRouter from './modules/auth/auth.routes';
import eventsRouter from './modules/events/events.routes';
import usersRouter from './modules/users/users.routes';
import categoriesRouter from './modules/categories/categories.routes';
import invitationsRouter from './modules/invitations/invitations.routes';
import notificationsRouter from './modules/notifications/notifications.routes';

const app = express();

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  }),
);

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Server is running' });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/notifications', notificationsRouter);


// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

// ── Global error handler (must be last) ───────────────────────
app.use(errorHandler);

export default app;
