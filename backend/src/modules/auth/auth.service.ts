import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { RegisterInput, LoginInput } from './auth.schema';
import { AuthTokenPayload } from '../../types';

export async function register(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
    },
  });

  const payload: AuthTokenPayload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const payload: AuthTokenPayload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}
