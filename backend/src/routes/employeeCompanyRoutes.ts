// src/routes/employeeCompanyRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { EmployeeCompanyController } from '@src/employee_company/controller';

export const employeeCompanyRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new EmployeeCompanyController(db);

  // CRUD
  r.post('/', c.create);
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.put('/:id', c.update);
  r.delete('/:id', c.delete);

  // Дополнительные фильтры
  r.get('/company/:companyId', c.getByCompany);
  r.get('/user/:userId', c.getByUser);

  return r;
};
