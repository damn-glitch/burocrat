// src/notification/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import NotificationService from './service';

export class NotificationController {
  private service: NotificationService;

  constructor(private db: PrismaClient) {
    this.service = new NotificationService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['title', 'description']);
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

  sendToUsers = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const { user_ids } = req.body;
    const result = await this.service.sendToUsers(id, user_ids);
    res.status(200).json(result);
  });

  getByUser = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const result = await this.service.getByUser(userId);
    res.status(200).json(result);
  });

  markAllRead = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const result = await this.service.markAllRead(userId);
    res.status(200).json(result);
  });

  markAsRead = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const notificationId = parseId(req.params.notificationId);
    const result = await this.service.markAsRead(userId, notificationId);
    res.status(200).json(result);
  });
}
