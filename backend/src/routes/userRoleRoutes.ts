// src/routes/userRoleRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { UserRoleController } from '@src/user_role/controller';

export const userRoleRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new UserRoleController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Дополнительные действия
  r.get('/user/:userId', c.getByUser);
  r.get('/role/:roleId', c.getByRole);
  r.put('/user/:userId/assign', c.assignRoles);
  r.put('/user/:userId/remove', c.removeRoles);

  return r;
};
