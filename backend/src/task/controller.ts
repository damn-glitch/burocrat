// src/task/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import TaskService from './service';

export class TaskController {
  private service: TaskService;

  constructor(private db: PrismaClient) {
    this.service = new TaskService(db);
  }

  create = asyncHandler(async (req: RequestType, res: Response) => {
    validateFields(req.body, ['name', 'path', 'status', 'priority', 'project_id']);
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

  getByProject = asyncHandler(async (req: RequestType, res: Response) => {
    const projectId = parseId(req.params.projectId);
    const result = await this.service.getByProject(projectId);
    res.status(200).json(result);
  });

  getByAssignee = asyncHandler(async (req: RequestType, res: Response) => {
    const assigneeId = parseId(req.params.assigneeId);
    const result = await this.service.getByAssignee(assigneeId);
    res.status(200).json(result);
  });

  getByManager = asyncHandler(async (req: RequestType, res: Response) => {
    const managerId = parseId(req.params.managerId);
    const result = await this.service.getByManager(managerId);
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

  changeStatus = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    validateFields(req.body, ['status']);
    const result = await this.service.changeStatus(id, req.body.status);
    res.status(200).json(result);
  });

  changePriority = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    validateFields(req.body, ['priority']);
    const result = await this.service.changePriority(id, req.body.priority);
    res.status(200).json(result);
  });
}
