// src/routes/companyRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { CompanyController } from '@src/company/controller';

export const companyRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new CompanyController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/my', c.getByUser);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Дополнительные действия
  r.put('/:id/activate', c.activate);
  r.put('/:id/deactivate', c.deactivate);

  return r;
};
