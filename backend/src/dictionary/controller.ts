// src/dictionary/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import DictionaryService from './service';

export class DictionaryController {
  private service: DictionaryService;

  constructor(private db: PrismaClient) {
    this.service = new DictionaryService(db);
  }

  getCountries = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.getCountries();
    res.status(201).json(result);
  });

  getIndustries = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.getIndustries();
    res.status(201).json(result);
  });

  getLegalForms = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.getLegalForms();
    res.status(201).json(result);
  });

}
