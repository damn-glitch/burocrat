// src/employee_company/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import EmployeeCompanyService from './service';

export class EmployeeCompanyController {
  private service: EmployeeCompanyService;

  constructor(private db: PrismaClient) {
    this.service = new EmployeeCompanyService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['user_id', 'company_id']);
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

  getByCompany = asyncHandler(async (req: RequestType, res: Response) => {
    const companyId = parseId(req.params.companyId);
    const result = await this.service.getByCompany(companyId);
    res.status(200).json(result);
  });

  getByUser = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const result = await this.service.getByUser(userId);
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
