// src/role/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import RoleService from './service';

export class RoleController {
  private service: RoleService;

  constructor(private db: PrismaClient) {
    this.service = new RoleService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['name']);
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

  assignPermissions = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const permissions = req.body.permissions ?? [];
    const result = await this.service.assignPermissions(id, permissions);
    res.status(200).json(result);
  });

  removePermissions = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const permissions = req.body.permissions ?? [];
    const result = await this.service.removePermissions(id, permissions);
    res.status(200).json(result);
  });
}
