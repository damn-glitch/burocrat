// src/permission/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import PermissionService from './service';

export class PermissionController {
  private service: PermissionService;

  constructor(private db: PrismaClient) {
    this.service = new PermissionService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['name', 'code']);
    const result = await this.service.create(req.body);
    res.status(201).json(result);
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

  getByCode = asyncHandler(async (req: RequestType, res: Response) => {
    const code = req.params.code;
    const result = await this.service.getByCode(code);
    res.status(200).json(result);
  });

  update = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.update(id, req.body);
    res.status(200).json(result);
  });

  delete = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.delete(id);
    res.status(200).json(result);
  });
}
