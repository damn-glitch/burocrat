// src/routes/aiAnalyzerRoutes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { AiAnalyzerController } from '@src/ai_analyzer/controller';

export const aiAnalyzerRoutes = (db: PrismaClient) => {
  const r = Router();
  const c = new AiAnalyzerController(db);

  // ==================== Анализ документов ====================

  // Анализ текста документа
  r.post('/analyze', c.analyzeText);

  // Анализ OCR результата
  r.post('/analyze-ocr/:ocrResultId', c.analyzeOcrResult);

  // Извлечение данных для генерации документа
  r.post('/extract-for-generation', c.extractForGeneration);

  // Классификация типа документа
  r.post('/classify', c.classifyDocument);

  // Суммаризация документа
  r.post('/summarize', c.summarizeDocument);

  // ==================== CRUD операции ====================

  // Получение анализов текущего пользователя
  r.get('/my', c.getMyAnalyses);

  // Получение анализов по OCR результату
  r.get('/ocr/:ocrResultId', c.getByOcrResult);

  // Получение анализа по ID
  r.get('/:id', c.getById);

  // Удаление анализа
  r.delete('/:id', c.delete);

  return r;
};
