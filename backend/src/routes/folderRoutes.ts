// src/routes/documentRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { DocumentController } from '@src/document/controller';

export const documentRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new DocumentController(db);

  // Папки
  r.post('/folder', c.createFolder);
  r.get('/folder', c.getFolders);
  r.get('/folder/:id', c.getFolderById);
  r.put('/folder/:id', c.updateFolder);
  r.delete('/folder/:id', c.deleteFolder);

  // Документы
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Поиск по папке/компании
  r.get('/company/:companyId', c.getByCompany);
  r.get('/folder/:folderId/docs', c.getByFolder);

  return r;
};
