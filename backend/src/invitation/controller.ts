// src/invitation/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import InvitationService from './service';

export class InvitationController {
  private service: InvitationService;

  constructor(private db: PrismaClient) {
    this.service = new InvitationService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['email', 'company_id']);
    const inviterId = req.userinfo?.user_id ?? req.body.invited_by ?? null;
    const result = await this.service.create(req.body, inviterId);
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

  getByStatus = asyncHandler(async (req: RequestType, res: Response) => {
    const status = req.params.status;
    const result = await this.service.getByStatus(status);
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

  accept = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.accept(id);
    res.status(200).json(result);
  });

  decline = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.decline(id);
    res.status(200).json(result);
  });
}
