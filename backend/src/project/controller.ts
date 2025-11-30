// src/project/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import ProjectService from './service';

export class ProjectController {
  private service: ProjectService;

  constructor(private db: PrismaClient) {
    this.service = new ProjectService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['name', 'company_id']);
    const result = await this.service.create(req.body, req.user_id!);
    res.status(200).json(result);
  });

  getAll = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.getAll(req.user_id!);
    res.status(200).json(result);
  });

  getById = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.getById(id);
    res.status(200).json(result);
  });

  getByCompany = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.getByCompany(id);
    res.status(200).json(result);
  });

  getByUser = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.getByUser(req.user_id!);
    res.status(200).json(result);
  });

  update = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.update(id, req.body, req.user_id!);
    res.status(200).json(result);
  });

  delete = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.delete(id, req.user_id!);
    res.status(200).json(result);
  });
}
