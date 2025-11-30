// src/routes/otpRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { OTPController } from '@src/otp/controller';

export const otpRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new OTPController(db);

  // CRUD
  r.post('/generate', c.generate);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.delete('/:id', c.delete);

  // Проверка и валидация
  r.post('/verify', c.verify);

  // Получение по пользователю и действию
  r.get('/user/:userId/:action', c.getByUserAction);

  return r;
};
