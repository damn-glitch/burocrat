// src/notification/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class NotificationService {
  constructor(private db: PrismaClient) {}

  async create(data: any) {
    validateFields(data, ['title', 'description']);

    const notification = await this.db.notification.create({
      data: {
        title: data.title.trim(),
        description: data.description,
        preview_image: data.preview_image ?? null,
        data: data.data ?? {},
      },
    });

    return { success: true, notification };
  }

  async getAll() {
    return this.db.notification.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user_notification: { select: { user_id: true, is_read: true } },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const notification = await this.db.notification.findUnique({
      where: { id },
      include: {
        user_notification: {
          include: { user: { select: { id: true, firstname: true, lastname: true } } },
        },
      } as any,
    });
    if (!notification) throw new BadRequestError('Уведомление не найдено.');
    return notification;
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const notif = await this.db.notification.findUnique({ where: { id } });
    if (!notif) throw new BadRequestError('Уведомление не найдено.');

    const updated = await this.db.notification.update({
      where: { id },
      data: {
        title: data.title ?? notif.title,
        description: data.description ?? notif.description,
        preview_image: data.preview_image ?? notif.preview_image,
        data: data.data ?? notif.data,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.notification.delete({ where: { id } });
    return { success: true };
  }

  async sendToUsers(notification_id: number, user_ids: number[]) {
    if (!notification_id) throw new BadRequestError('notification_id обязателен.');
    if (!Array.isArray(user_ids) || user_ids.length === 0) throw new BadRequestError('user_ids должен быть массивом.');

    const notif = await this.db.notification.findUnique({ where: { id: notification_id } });
    if (!notif) throw new BadRequestError('Уведомление не найдено.');

    for (const uid of user_ids) {
      const user = await this.db.users.findUnique({ where: { id: uid } });
      if (!user) throw new BadRequestError(`Пользователь с ID ${uid} не найден.`);

      const exists = await this.db.user_notification.findFirst({
        where: { user_id: uid, notification_id },
      });
      if (!exists) {
        await this.db.user_notification.create({
          data: { user_id: uid, notification_id },
        });
      }
    }

    return { success: true, message: 'Уведомление успешно отправлено пользователям.' };
  }

  async getByUser(user_id: number) {
    if (!user_id) throw new BadRequestError('user_id обязателен.');
    return this.db.user_notification.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
      include: {
        notification: { select: { id: true, title: true, description: true, created_at: true } },
      } as any,
    });
  }

  async markAllRead(user_id: number) {
    if (!user_id) throw new BadRequestError('user_id обязателен.');
    await this.db.user_notification.updateMany({
      where: { user_id, is_read: false },
      data: { is_read: true, read_at: new Date() },
    });
    return { success: true };
  }

  async markAsRead(user_id: number, notification_id: number) {
    if (!user_id || !notification_id) throw new BadRequestError('user_id и notification_id обязательны.');
    const notif = await this.db.user_notification.findFirst({ where: { user_id, notification_id } });
    if (!notif) throw new BadRequestError('Уведомление пользователя не найдено.');

    await this.db.user_notification.update({
      where: { id: notif.id },
      data: { is_read: true, read_at: new Date() },
    });

    return { success: true };
  }
}

export default NotificationService;
