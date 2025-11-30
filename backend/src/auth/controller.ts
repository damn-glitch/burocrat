// src/company/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import AuthService from '@src/auth/service';

export class AuthController {
  private service: AuthService;

  constructor(private db: PrismaClient) {
    this.service = new AuthService(db);
  }

  register = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.register(req.body);
    res.status(200).json(result);
  });
  login = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.login(req.body);
    res.status(200).json(result);
  });
  refresh = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.refresh(req.body);
    res.status(201).json(result);
  });
  logout = asyncHandler(async (req: RequestType, res: Response) => {
    const result = await this.service.logout(req.body);
    res.status(201).json(result);
  });

}
