// src/position/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class PositionService {
  constructor(private db: PrismaClient) {}

  async create(data: any) {
    validateFields(data, ['name']);

    const existing = await this.db.position.findFirst({
      where: { name: data.name.trim() },
    });
    if (existing) throw new BadRequestError('Должность с таким названием уже существует.');

    const position = await this.db.position.create({
      data: {
        name: data.name.trim(),
        code: data.code ?? null,
        description: data.description ?? null,
      },
    });

    return { success: true, position };
  }

  async getAll() {
    return this.db.position.findMany({
      orderBy: { created_at: 'asc' },
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const pos = await this.db.position.findUnique({ where: { id } });
    if (!pos) throw new BadRequestError('Должность не найдена.');
    return pos;
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const pos = await this.db.position.findUnique({ where: { id } });
    if (!pos) throw new BadRequestError('Должность не найдена.');

    const updated = await this.db.position.update({
      where: { id },
      data: {
        name: data.name ?? pos.name,
        code: data.code ?? pos.code,
        description: data.description ?? pos.description,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.position.delete({ where: { id } });
    return { success: true };
  }
}

export default PositionService;
