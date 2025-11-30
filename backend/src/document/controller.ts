// src/document/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import DocumentService from './service';

export class DocumentController {
  private service: DocumentService;

  constructor(private db: PrismaClient) {
    this.service = new DocumentService(db);
  }

  // ---------------- Folder ----------------
  createFolder = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['name', 'company_id']);
    const result = await this.service.createFolder(req.body);
    res.status(201).json(result);
  });

  getFolders = asyncHandler(async (_req: RequestType, res: Response) => {
    const result = await this.service.getFolders();
    res.status(200).json(result);
  });

  getFolderById = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.getFolderById(id);
    res.status(200).json(result);
  });

  updateFolder = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.updateFolder(id, req.body);
    res.status(200).json(result);
  });

  deleteFolder = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.deleteFolder(id);
    res.status(200).json(result);
  });

  // ---------------- Documents ----------------
  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['title', 'company_id']);
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

  getByFolder = asyncHandler(async (req: RequestType, res: Response) => {
    const folderId = parseId(req.params.folderId);
    const result = await this.service.getByFolder(folderId);
    res.status(200).json(result);
  });

  getByCompany = asyncHandler(async (req: RequestType, res: Response) => {
    const companyId = parseId(req.params.companyId);
    const result = await this.service.getByCompany(companyId);
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
