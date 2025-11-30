// src/routes/documentGeneratorRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { DocumentGeneratorController } from '@src/document_generator/controller';

export const documentGeneratorRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new DocumentGeneratorController(db);

  // ==================== Генерация документов ====================

  // Генерация счёта на оплату
  r.post('/invoice', c.generateInvoice);

  // Генерация товарной накладной
  r.post('/waybill', c.generateWaybill);

  // Генерация акта выполненных работ
  r.post('/completion-act', c.generateCompletionAct);

  // ==================== CRUD операции ====================

  // Получение документов текущего пользователя
  r.get('/my', c.getMyDocuments);

  // Получение документов по компании
  r.get('/company/:companyId', c.getByCompany);

  // Получение документа по ID
  r.get('/:id', c.getById);

  // Скачивание PDF
  r.get('/:id/download', c.downloadPdf);

  // Обновление статуса документа
  r.patch('/:id/status', c.updateStatus);

  // Удаление документа
  r.delete('/:id', c.delete);

  return r;
};
