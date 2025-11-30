// src/user_settings/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import UserSettingsService from './service';

export class UserSettingsController {
  private service: UserSettingsService;

  constructor(private db: PrismaClient) {
    this.service = new UserSettingsService(db);
  }

  createOrUpdate = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['user_id', 'slug', 'value']);
    const result = await this.service.createOrUpdate(req.body);
    res.status(201).json(result);
  });

  getByUser = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const result = await this.service.getByUser(userId);
    res.status(200).json(result);
  });

  getUserSetting = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const slug = req.params.slug;
    const result = await this.service.getUserSetting(userId, slug);
    res.status(200).json(result);
  });

  delete = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.delete(id);
    res.status(200).json(result);
  });
}
