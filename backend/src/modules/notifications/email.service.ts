import nodemailer from 'nodemailer';
import { env } from '../../config/env';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null; // Email not configured — caller should skip sending
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email. Never throws — logs and returns false on any failure so
 * callers (invitation/event flows) are never blocked by email issues.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<boolean> {
  try {
    const t = getTransporter();
    if (!t) {
      console.warn('[email] SMTP not configured, skipping email to', to);
      return false;
    }
    await t.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error: any) {
    console.error('[email] Failed to send email:', error.message);
    return false;
  }
}
