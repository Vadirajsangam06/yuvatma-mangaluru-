import './config/env'; // validate env vars first
import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';
import { processReminders } from './modules/notifications/reminders.service';

const REMINDER_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function main() {
  // Verify DB connection before accepting traffic
  await prisma.$connect();
  console.log('✅ Database connected');

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  // Event reminder scheduler — runs on an interval, never throws (each run
  // is self-contained and errors are caught inside processReminders), so a
  // failure here can never crash the server or affect request handling.
  setInterval(() => {
    processReminders().catch((err) => {
      console.error('[reminders] Unexpected scheduler error:', err.message);
    });
  }, REMINDER_CHECK_INTERVAL_MS);
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
