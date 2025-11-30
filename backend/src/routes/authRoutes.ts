// src/routes/authRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { AuthController } from '@src/auth/controller';

export const authRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new AuthController(db);

  r.post('/register', c.register);
  r.post('/login', c.login);
  r.post('/refresh', c.refresh);
  r.post('/logout', c.logout);

  return r;
};
