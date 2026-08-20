import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schema';
import { AuthTokenPayload } from '../../types';
import { sendEmail } from '../notifications/email.service';
import { passwordResetEmail, passwordChangedEmail } from '../notifications/email.templates';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 60 minutes

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function register(data: RegisterInput) {
  const validated = registerSchema.parse(data);
  const existingUser = await prisma.user.findUnique({ where: { email: validated.email.toLowerCase() } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(validated.password, 12);

  const user = await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email.toLowerCase(),
      passwordHash,
      phone: validated.phone,
    },
  });

  const payload: AuthTokenPayload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export async function login(data: LoginInput) {
  const validated = loginSchema.parse(data);
  const user = await prisma.user.findUnique({ where: { email: validated.email.toLowerCase() } });
  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(validated.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const payload: AuthTokenPayload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export async function forgotPassword(data: ForgotPasswordInput) {
  const validated = forgotPasswordSchema.parse(data);
  const genericResponse = {
    message: 'If your email is registered, you will receive a password reset link shortly.',
  };

  const user = await prisma.user.findUnique({ where: { email: validated.email.toLowerCase() } });
  if (!user) {
    // Return generic message to prevent email enumeration
    return genericResponse;
  }

  // Invalidate any existing unused reset tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Generate cryptographically secure random token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  // Store hashed token in DB
  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  const frontendOrigin = env.CORS_ORIGINS[0] || 'http://localhost:5173';
  const resetUrl = `${frontendOrigin}/reset-password?token=${rawToken}`;

  // Non-blocking email dispatch
  sendEmail({
    to: user.email,
    subject: 'Reset Your Password - Yuvatma Mangaluru',
    html: passwordResetEmail(user.name, resetUrl, 60),
  }).catch((err) => {
    console.error('[email] Password reset dispatch error (non-blocking):', err.message);
  });

  return genericResponse;
}

export async function resetPassword(data: ResetPasswordInput) {
  const validated = resetPasswordSchema.parse(data);
  const tokenHash = hashToken(validated.token);

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetRecord) {
    throw new Error('Invalid or expired password reset link');
  }

  if (resetRecord.usedAt !== null) {
    throw new Error('This password reset link has already been used');
  }

  if (resetRecord.expiresAt < new Date()) {
    throw new Error('This password reset link has expired');
  }

  const passwordHash = await bcrypt.hash(validated.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: resetRecord.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  // Send confirmation email
  sendEmail({
    to: resetRecord.user.email,
    subject: 'Password Changed Successfully - Yuvatma Mangaluru',
    html: passwordChangedEmail(resetRecord.user.name),
  }).catch((err) => {
    console.error('[email] Password change confirmation error (non-blocking):', err.message);
  });

  return { message: 'Password has been reset successfully. You can now sign in with your new password.' };
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const validated = changePasswordSchema.parse(data);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.passwordHash) {
    throw new Error('This account does not have a local password configured');
  }

  const isCurrentValid = await bcrypt.compare(validated.currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    throw new Error('Current password is incorrect');
  }

  const isSamePassword = await bcrypt.compare(validated.newPassword, user.passwordHash);
  if (isSamePassword) {
    throw new Error('New password cannot be the same as your current password');
  }

  const passwordHash = await bcrypt.hash(validated.newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  // Send confirmation email
  sendEmail({
    to: user.email,
    subject: 'Password Changed Successfully - Yuvatma Mangaluru',
    html: passwordChangedEmail(user.name),
  }).catch((err) => {
    console.error('[email] Password change confirmation error (non-blocking):', err.message);
  });

  return { message: 'Password changed successfully' };
}

