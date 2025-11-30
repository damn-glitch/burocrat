// src/routes/notificationRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { NotificationController } from '@src/notification/controller';

export const notificationRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new NotificationController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Рассылка и управление пользователями
  r.post('/:id/send', c.sendToUsers);
  r.get('/user/:userId', c.getByUser);
  r.put('/user/:userId/mark_read', c.markAllRead);
  r.put('/user/:userId/:notificationId/read', c.markAsRead);

  return r;
};
