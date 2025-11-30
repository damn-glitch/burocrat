// src/routes/dictionaryRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { DictionaryController } from '@src/dictionary/controller';

export const dictionaryRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new DictionaryController(db);

  // CRUD
  r.get('/country', c.getCountries);
  r.get('/industry', c.getIndustries);
  r.get('/legal-form', c.getLegalForms);

  return r;
};
