// src/ai_analyzer/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import AiAnalyzerService from './service';

export class AiAnalyzerController {
  private service: AiAnalyzerService;

  constructor(private db: PrismaClient) {
    this.service = new AiAnalyzerService(db);
  }

  // Анализ текста документа
  analyzeText = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['text']);

    const { text, ocr_result_id } = req.body;

    const result = await this.service.analyzeDocument(
      text,
      ocr_result_id ? parseInt(ocr_result_id) : undefined,
      req.user_id
    );

    res.status(200).json(result);
  });

  // Анализ OCR результата
  analyzeOcrResult = asyncHandler(async (req: RequestType, res: Response) => {
    const ocrResultId = parseId(req.params.ocrResultId);

    const result = await this.service.analyzeOcrResult(ocrResultId, req.user_id);

    res.status(200).json(result);
  });

  // Извлечение данных для генерации документа
  extractForGeneration = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['text', 'target_type']);

    const { text, target_type } = req.body;

    if (!['invoice', 'waybill', 'completion_act'].includes(target_type)) {
      return res.status(400).json({ error: 'Недопустимый тип документа' });
    }

    const result = await this.service.extractForGeneration(text, target_type);

    res.status(200).json(result);
  });

  // Классификация типа документа
  classifyDocument = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['text']);

    const result = await this.service.classifyDocument(req.body.text);

    res.status(200).json(result);
  });

  // Суммаризация документа
  summarizeDocument = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['text']);

    const result = await this.service.summarizeDocument(req.body.text);

    res.status(200).json(result);
  });

  // Получение анализа по ID
  getById = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.getById(id);
    res.status(200).json(result);
  });

  // Получение анализов по OCR результату
  getByOcrResult = asyncHandler(async (req: RequestType, res: Response) => {
    const ocrResultId = parseId(req.params.ocrResultId);
    const result = await this.service.getByOcrResult(ocrResultId);
    res.status(200).json(result);
  });

  // Получение анализов текущего пользователя
  getMyAnalyses = asyncHandler(async (req: RequestType, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.service.getByUser(req.user_id!, page, limit);
    res.status(200).json(result);
  });

  // Удаление анализа
  delete = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.delete(id);
    res.status(200).json(result);
  });
}
