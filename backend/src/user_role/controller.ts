// src/user_role/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import UserRoleService from './service';

export class UserRoleController {
  private service: UserRoleService;

  constructor(private db: PrismaClient) {
    this.service = new UserRoleService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['user_id', 'role_id']);
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

  getByUser = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const result = await this.service.getByUser(userId);
    res.status(200).json(result);
  });

  getByRole = asyncHandler(async (req: RequestType, res: Response) => {
    const roleId = parseId(req.params.roleId);
    const result = await this.service.getByRole(roleId);
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

  assignRoles = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const result = await this.service.assignRoles(userId, req.body.roles);
    res.status(200).json(result);
  });

  removeRoles = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const result = await this.service.removeRoles(userId, req.body.roles);
    res.status(200).json(result);
  });
}
