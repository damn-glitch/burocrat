// src/settings/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class SettingsService {
  constructor(private db: PrismaClient) {}

  async create(data: any) {
    validateFields(data, ['slug', 'name']);

    const exists = await this.db.settings.findFirst({
      where: { slug: data.slug.trim() },
    });
    if (exists) throw new BadRequestError('Настройка с таким slug уже существует.');

    const setting = await this.db.settings.create({
      data: {
        slug: data.slug.trim(),
        name: data.name.trim(),
        type: data.type ?? 'string',
      },
    });

    return { success: true, setting };
  }

  async getAll() {
    return this.db.settings.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const setting = await this.db.settings.findUnique({ where: { id } });
    if (!setting) throw new BadRequestError('Настройка не найдена.');
    return setting;
  }

  async getBySlug(slug: string) {
    if (!slug) throw new BadRequestError('Slug обязателен.');
    const setting = await this.db.settings.findFirst({ where: { slug } });
    if (!setting) throw new BadRequestError('Настройка не найдена.');
    return setting;
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const setting = await this.db.settings.findUnique({ where: { id } });
    if (!setting) throw new BadRequestError('Настройка не найдена.');

    const updated = await this.db.settings.update({
      where: { id },
      data: {
        slug: data.slug ?? setting.slug,
        name: data.name ?? setting.name,
        type: data.type ?? setting.type,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.settings.delete({ where: { id } });
    return { success: true };
  }
}

export default SettingsService;
