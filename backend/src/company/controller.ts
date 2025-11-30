// src/company/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import CompanyService from './service';

export class CompanyController {
  private service: CompanyService;

  constructor(private db: PrismaClient) {
    this.service = new CompanyService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['name']);
    const ownerId = req.user_id;
    const result = await this.service.create(req.body, ownerId);
    res.status(200).json(result);
  });

  getByUser = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.getByUser(req.user_id!);
    res.status(200).json(result);
  });

  getAll = asyncHandler(async (_req: RequestType, res: Response) => {
    const result = await this.service.getAll();
    res.status(200).json(result);
  });

  getById = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.getById(id);
    res.status(200).json(result);
  });

  update = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.update(id, req.body, req.user_id);
    res.status(200).json(result);
  });

  delete = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.delete(id);
    res.status(200).json(result);
  });

  activate = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.activate(id);
    res.status(200).json(result);
  });

  deactivate = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.deactivate(id);
    res.status(200).json(result);
  });
}
