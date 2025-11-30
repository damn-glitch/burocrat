import { NextFunction, Request, Response } from 'express';

export interface UserInfoInterface {
  user_id: number;
  user_name: string;
  main_organization_unit_id: number;
  main_organization_unit_external_id: number;
  permissions: string[];
}

export interface RequestType extends Request {
  user_id?: number;
  userinfo?: UserInfoInterface;
  file?: Express.Multer.File & { origin_path?: string };
  files?: { [fieldname: string]: Express.Multer.File[] };
}

export const asyncHandler =
  <T extends (req: RequestType, res: Response, next: NextFunction) => Promise<any>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
