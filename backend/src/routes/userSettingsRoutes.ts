// src/routes/userSettingsRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { UserSettingsController } from '@src/user_settings/controller';

export const userSettingsRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new UserSettingsController(db);

  // CRUD
  r.post('/', c.createOrUpdate);
  r.get('/user/:userId', c.getByUser);
  r.get('/user/:userId/:slug', c.getUserSetting);
  r.delete('/:id', c.delete);

  return r;
};
