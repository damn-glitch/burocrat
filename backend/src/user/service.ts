// src/user/service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { BadRequestError, NotFoundError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class UserService {
  constructor(private db: PrismaClient) {}

  async create(data: any) {
    validateFields(data, ['firstname', 'lastname', 'username', 'password_hash', 'email']);

    const existing = await this.db.users.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
    });
    if (existing) throw new BadRequestError('Пользователь с таким username или email уже существует.');

    const passwordHash = await bcrypt.hash(data.password_hash, 12);

    const user = await this.db.users.create({
      data: {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        middlename: data.middlename?.trim() ?? null,
        username: data.username.trim(),
        email: data.email.trim(),
        phone: data.phone ?? null,
        avatar: data.avatar ?? null,
        password_hash: passwordHash,
      },
    });

    return { success: true, user };
  }

  async getAll() {
    return this.db.users.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  async getById(id?: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const user = await this.db.users.findUnique({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        middlename: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        is_active: true,
        created_at: true,
      },
    });
    if (!user) throw new NotFoundError('Пользователь не найден.');
    return user;
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const user = await this.db.users.findUnique({ where: { id } });
    if (!user) throw new BadRequestError('Пользователь не найден.');

    const updated = await this.db.users.update({
      where: { id },
      data: {
        firstname: data.firstname ?? user.firstname,
        lastname: data.lastname ?? user.lastname,
        middlename: data.middlename ?? user.middlename,
        avatar: data.avatar ?? user.avatar,
        phone: data.phone ?? user.phone,
        email: data.email ?? user.email,
        username: data.username ?? user.username,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.users.delete({ where: { id } });
    return { success: true };
  }

  async resetPassword(id: number, newPassword: string) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.db.users.update({
      where: { id },
      data: { password_hash: passwordHash, login_attempts: 0 },
    });
    return { success: true };
  }

  async toggleActive(id: number) {
    const user = await this.db.users.findUnique({ where: { id } });
    if (!user) throw new BadRequestError('Пользователь не найден.');
    await this.db.users.update({
      where: { id },
      data: { is_active: !user.is_active },
    });
    return { success: true, is_active: !user.is_active };
  }
}

export default UserService;
