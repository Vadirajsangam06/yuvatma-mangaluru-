// Shared backend TypeScript types — mirrors the Prisma schema

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
