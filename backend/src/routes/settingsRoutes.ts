// src/routes/settingsRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { SettingsController } from '@src/settings/controller';

export const settingsRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new SettingsController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Получение по slug
  r.get('/slug/:slug', c.getBySlug);

  return r;
};
