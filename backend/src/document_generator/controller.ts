// src/document_generator/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import DocumentGeneratorService from './service';
import { DocumentType, DocumentStatus } from './types';

export class DocumentGeneratorController {
  private service: DocumentGeneratorService;

  constructor(private db: PrismaClient) {
    this.service = new DocumentGeneratorService(db);
  }

  // ==================== Генерация документов ====================

  // Генерация счёта на оплату
  generateInvoice = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['seller', 'buyer', 'items', 'invoice_date']);

    const { company_id, ...data } = req.body;

    const result = await this.service.generateInvoice(
      data,
      req.user_id,
      company_id ? parseInt(company_id) : undefined
    );

    res.status(201).json({ success: true, result });
  });

  // Генерация товарной накладной
  generateWaybill = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['seller', 'buyer', 'items', 'waybill_date']);

    const { company_id, ...data } = req.body;

    const result = await this.service.generateWaybill(
      data,
      req.user_id,
      company_id ? parseInt(company_id) : undefined
    );

    res.status(201).json({ success: true, result });
  });

  // Генерация акта выполненных работ
  generateCompletionAct = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['executor', 'customer', 'items', 'act_date']);

    const { company_id, ...data } = req.body;

    const result = await this.service.generateCompletionAct(
      data,
      req.user_id,
      company_id ? parseInt(company_id) : undefined
    );

    res.status(201).json({ success: true, result });
  });

  // ==================== CRUD операции ====================

  // Получение документа по ID
  getById = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.getById(id);
    res.status(200).json(result);
  });

  // Получение документов по компании
  getByCompany = asyncHandler(async (req: RequestType, res: Response) => {
    const companyId = parseId(req.params.companyId);
    const type = req.query.type as DocumentType | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.service.getByCompany(companyId, type, page, limit);
    res.status(200).json(result);
  });

  // Получение документов текущего пользователя
  getMyDocuments = asyncHandler(async (req: RequestType, res: Response) => {
    const type = req.query.type as DocumentType | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.service.getByUser(req.user_id!, type, page, limit);
    res.status(200).json(result);
  });

  // Обновление статуса документа
  updateStatus = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    validateFields(req.body, ['status']);

    const result = await this.service.updateStatus(id, req.body.status as DocumentStatus);
    res.status(200).json(result);
  });

  // Удаление документа
  delete = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.delete(id);
    res.status(200).json(result);
  });

  // Скачивание PDF
  downloadPdf = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const { buffer, fileName } = await this.service.downloadPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(buffer);
  });
}
