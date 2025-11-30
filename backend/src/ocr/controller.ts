// src/ocr/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import OcrService from './service';

export class OcrController {
  private service: OcrService;

  constructor(private db: PrismaClient) {
    this.service = new OcrService(db);
  }

  // Обработка загруженного изображения
  processImage = asyncHandler(async (req: RequestType, res: Response) => {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const { company_id, language } = req.body;

    const result = await this.service.processImage(
      file.path,
      req.user_id,
      company_id ? parseInt(company_id) : undefined,
      language || 'rus+eng'
    );

    res.status(200).json(result);
  });

  // Обработка base64 изображения
  processBase64 = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['image']);

    const { image, company_id, language } = req.body;

    const result = await this.service.processBase64Image(
      image,
      req.user_id,
      company_id ? parseInt(company_id) : undefined,
      language || 'rus+eng'
    );

    res.status(200).json(result);
  });

  // Получение результата по ID
  getById = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.getById(id);
    res.status(200).json(result);
  });

  // Получение результатов по компании
  getByCompany = asyncHandler(async (req: RequestType, res: Response) => {
    const companyId = parseId(req.params.companyId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.service.getByCompany(companyId, page, limit);
    res.status(200).json(result);
  });

  // Получение результатов пользователя
  getMyResults = asyncHandler(async (req: RequestType, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.service.getByUser(req.user_id!, page, limit);
    res.status(200).json(result);
  });

  // Удаление результата
  delete = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.delete(id);
    res.status(200).json(result);
  });
}
