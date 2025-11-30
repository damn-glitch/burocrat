// src/user/controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import UserService from './service';

export class UserController {
  private service: UserService;

  constructor(private db: PrismaClient) {
    this.service = new UserService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.create(req.body);
    res.status(201).json(result);
  });

  getAll = asyncHandler(async (_req: RequestType, res: Response) => {
    const users = await this.service.getAll();
    res.status(200).json(users);
  });

  getById = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const user = await this.service.getById(id);
    res.status(200).json(user);
  });

  getCurrent = asyncHandler(async (req: RequestType, res: Response) => {
    const id = req.user_id;
    console.log(req.user_id);
    const user = await this.service.getById(id);
    res.status(200).json(user);
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

  resetPassword = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    validateFields(req.body, ['password']);
    const result = await this.service.resetPassword(id, req.body.password);
    res.status(200).json(result);
  });

  toggleActive = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.toggleActive(id);
    res.status(200).json(result);
  });
}
