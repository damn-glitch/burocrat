// src/routes/permissionRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { PermissionController } from '@src/permission/controller';

export const permissionRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new PermissionController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Поиск по коду
  r.get('/code/:code', c.getByCode);

  return r;
};
