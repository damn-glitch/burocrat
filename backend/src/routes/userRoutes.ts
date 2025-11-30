// src/routes/userRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { UserController } from '@src/user/controller';

export const userRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new UserController(db);

  // Создание пользователя
  r.post('/', c.create);
  // Получить всех пользователей
  r.get('/', c.getCurrent);
  // r.get('/', c.getAll);
  // Получить одного пользователя
  r.get('/:id', c.getById);
  // Обновить пользователя
  r.put('/:id', c.update);
  // Удалить (мягко или полностью)
  r.delete('/:id', c.delete);
  // Сброс пароля
  r.put('/:id/reset_password', c.resetPassword);
  // Блокировка / разблокировка
  r.put('/:id/toggle_active', c.toggleActive);

  return r;
};
