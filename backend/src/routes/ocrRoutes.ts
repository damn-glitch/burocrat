// src/routes/ocrRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { OcrController } from '@src/ocr/controller';
import { uploadOcr } from '@src/middlewares/upload';

export const ocrRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new OcrController(db);

  // Обработка загруженного изображения
  r.post('/process', uploadOcr.single('image'), c.processImage);

  // Обработка base64 изображения
  r.post('/process-base64', c.processBase64);

  // Получение результата по ID
  r.get('/:id', c.getById);

  // Получение результатов по компании
  r.get('/company/:companyId', c.getByCompany);

  // Получение результатов текущего пользователя
  r.get('/my/results', c.getMyResults);

  // Удаление результата
  r.delete('/:id', c.delete);

  return r;
};
