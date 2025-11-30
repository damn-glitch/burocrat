// src/otp/controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, RequestType } from '@src/http/asyncHandler';
import { parseId } from '@src/http/params';
import { validateFields } from '@utils/additional';
import OTPService from './service';
import { BadRequestError } from '@src/http/errors';

export class OTPController {
  private service: OTPService;

  constructor(private db: PrismaClient) {
    this.service = new OTPService(db);
  }

  /**
   * 🔹 Создание и отправка OTP
   * Поддерживает действия: verify, reset_password, change_phone, change_email
   * Поддерживает типы отправки: whatsapp, email
   */
  generate = asyncHandler(async (req: RequestType, res: Response) => {
    const { user_id, type, action, new_phone, new_email } = req.body;
    validateFields(req.body, ['user_id', 'type', 'action']);

    // Дополнительная валидация для специфичных действий
    if (action === 'change_phone' && !new_phone) {
      throw new BadRequestError('Для действия change_phone требуется new_phone');
    }
    if (action === 'change_email' && !new_email) {
      throw new BadRequestError('Для действия change_email требуется new_email');
    }

    const result = await this.service.generate(req.body);
    res.status(201).json(result);
  });

  /**
   * 🔹 Проверка кода OTP и выполнение действия
   * (Активация аккаунта, сброс пароля, смена email/телефона)
   */
  verify = asyncHandler(async (req: RequestType, res: Response) => {
    const { user_id, code, action } = req.body;
    validateFields(req.body, ['user_id', 'code', 'action']);

    // Дополнительная валидация входных параметров для конкретных действий
    if (action === 'reset_password' && !req.body.new_password) {
      throw new BadRequestError('Для действия reset_password требуется new_password');
    }
    if (action === 'change_phone' && !req.body.new_phone) {
      throw new BadRequestError('Для действия change_phone требуется new_phone');
    }
    if (action === 'change_email' && !req.body.new_email) {
      throw new BadRequestError('Для действия change_email требуется new_email');
    }

    const result = await this.service.verify(req.body);
    res.status(200).json(result);
  });

  /**
   * 🔹 Получить все OTP (для админки)
   */
  getAll = asyncHandler(async (_req: RequestType, res: Response) => {
    const result = await this.service.getAll();
    res.status(200).json(result);
  });

  /**
   * 🔹 Получить OTP по ID
   */
  getById = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.getById(id);
    res.status(200).json(result);
  });

  /**
   * 🔹 Получить OTP по user_id и типу действия
   */
  getByUserAction = asyncHandler(async (req: RequestType, res: Response) => {
    const userId = parseId(req.params.userId);
    const action = req.params.action;
    const result = await this.service.getByUserAction(userId, action);
    res.status(200).json(result);
  });

  /**
   * 🔹 Удаление OTP
   */
  delete = asyncHandler(async (req: RequestType, res: Response) => {
    const id = parseId(req.params.id);
    const result = await this.service.delete(id);
    res.status(200).json(result);
  });
}
