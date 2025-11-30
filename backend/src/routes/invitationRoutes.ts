// src/routes/invitationRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { InvitationController } from '@src/invitation/controller';

export const invitationRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new InvitationController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Дополнительные действия
  r.get('/company/:companyId', c.getByCompany);
  r.get('/status/:status', c.getByStatus);
  r.put('/:id/accept', c.accept);
  r.put('/:id/decline', c.decline);

  return r;
};
