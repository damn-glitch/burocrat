// src/routes/documentRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { DocumentController } from '@src/document/controller';

export const documentRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new DocumentController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Получение документов по компании или папке
  r.get('/company/:companyId', c.getByCompany);
  r.get('/folder/:folderId', c.getByFolder);

  return r;
};
