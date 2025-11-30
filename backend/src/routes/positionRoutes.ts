// src/routes/positionRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { PositionController } from '@src/position/controller';

export const positionRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new PositionController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  return r;
};
