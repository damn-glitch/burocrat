// src/routes/taskRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { TaskController } from '@src/task/controller';

export const taskRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new TaskController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Фильтры
  r.get('/project/:projectId', c.getByProject);
  r.get('/assignee/:assigneeId', c.getByAssignee);
  r.get('/manager/:managerId', c.getByManager);

  // Изменение статуса
  r.put('/:id/status', c.changeStatus);
  r.put('/:id/priority', c.changePriority);

  return r;
};
