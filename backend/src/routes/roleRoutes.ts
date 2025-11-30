// src/routes/roleRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { RoleController } from '@src/role/controller';

export const roleRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new RoleController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Управление разрешениями
  r.put('/:id/assign_permissions', c.assignPermissions);
  r.put('/:id/remove_permissions', c.removePermissions);

  return r;
};
