// src/routes/projectRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { ProjectController } from '@src/project/controller';

export const projectRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new ProjectController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/my', c.getByUser);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Фильтр по компании
  r.get('/company/:id', c.getByCompany);

  return r;
};
