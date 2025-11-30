// src/user_settings/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class UserSettingsService {
  constructor(private db: PrismaClient) {}

  async createOrUpdate(data: any) {
    validateFields(data, ['user_id', 'slug', 'value']);

    const user = await this.db.users.findUnique({ where: { id: data.user_id } });
    if (!user) throw new BadRequestError('Пользователь не найден.');

    const setting = await this.db.settings.findFirst({ where: { slug: data.slug } });
    if (!setting) throw new BadRequestError('Глобальная настройка с таким slug не найдена.');

    const existing = await this.db.user_settings.findFirst({
      where: { user_id: data.user_id, setting_id: setting.id },
    });

    if (existing) {
      const updated = await this.db.user_settings.update({
        where: { id: existing.id },
        data: { value: data.value },
      });
      return { success: true, updated };
    }

    const created = await this.db.user_settings.create({
      data: {
        user_id: data.user_id,
        setting_id: setting.id,
        value: data.value,
      },
    });

    return { success: true, created };
  }

  async getByUser(user_id: number) {
    if (!user_id) throw new BadRequestError('user_id обязателен.');
    return this.db.user_settings.findMany({
      where: { user_id },
      include: {
        settings: { select: { slug: true, name: true, type: true } },
      } as any,
    });
  }

  async getUserSetting(user_id: number, slug: string) {
    if (!user_id) throw new BadRequestError('user_id обязателен.');
    if (!slug) throw new BadRequestError('slug обязателен.');

    const setting = await this.db.settings.findFirst({ where: { slug } });
    if (!setting) throw new BadRequestError('Настройка не найдена.');

    const userSetting = await this.db.user_settings.findFirst({
      where: { user_id, setting_id: setting.id },
    });

    return userSetting ?? { user_id, slug, value: null };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.user_settings.delete({ where: { id } });
    return { success: true };
  }
}

export default UserSettingsService;
