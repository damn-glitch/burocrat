// src/user_role/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class UserRoleService {
  constructor(private db: PrismaClient) {}

  async create(data: any) {
    validateFields(data, ['user_id', 'role_id']);

    const user = await this.db.users.findUnique({ where: { id: data.user_id } });
    if (!user) throw new BadRequestError('Пользователь не найден.');

    const role = await this.db.roles.findUnique({ where: { id: data.role_id } });
    if (!role) throw new BadRequestError('Роль не найдена.');

    const existing = await this.db.user_role_rel.findFirst({
      where: { user_id: data.user_id, role_id: data.role_id },
    });
    if (existing) throw new BadRequestError('Роль уже назначена пользователю.');

    const rel = await this.db.user_role_rel.create({
      data: {
        user_id: data.user_id,
        role_id: data.role_id,
      },
    });

    return { success: true, user_role_rel: rel };
  }

  async getAll() {
    return this.db.user_role_rel.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, firstname: true, lastname: true, username: true } },
        role: { select: { id: true, name: true, code: true } },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const rel = await this.db.user_role_rel.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstname: true, lastname: true, username: true } },
        role: { select: { id: true, name: true, code: true } },
      } as any,
    });
    if (!rel) throw new BadRequestError('Связь user-role не найдена.');
    return rel;
  }

  async getByUser(user_id: number) {
    if (!user_id) throw new BadRequestError('user_id обязателен.');
    return this.db.user_role_rel.findMany({
      where: { user_id },
      include: {
        role: { select: { id: true, name: true, code: true } },
      } as any,
    });
  }

  async getByRole(role_id: number) {
    if (!role_id) throw new BadRequestError('role_id обязателен.');
    return this.db.user_role_rel.findMany({
      where: { role_id },
      include: {
        user: { select: { id: true, firstname: true, lastname: true, username: true } },
      } as any,
    });
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const rel = await this.db.user_role_rel.findUnique({ where: { id } });
    if (!rel) throw new BadRequestError('Связь не найдена.');

    const updated = await this.db.user_role_rel.update({
      where: { id },
      data: {
        user_id: data.user_id ?? rel.user_id,
        role_id: data.role_id ?? rel.role_id,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.user_role_rel.delete({ where: { id } });
    return { success: true };
  }

  async assignRoles(user_id: number, roles: string[]) {
    if (!user_id) throw new BadRequestError('user_id обязателен.');
    if (!roles || roles.length === 0) throw new BadRequestError('Необходимо указать список ролей.');

    const user = await this.db.users.findUnique({ where: { id: user_id } });
    if (!user) throw new BadRequestError('Пользователь не найден.');

    for (const roleCode of roles) {
      const role = await this.db.roles.findFirst({ where: { code: roleCode } });
      if (!role) throw new BadRequestError(`Роль с кодом "${roleCode}" не найдена.`);

      const exists = await this.db.user_role_rel.findFirst({
        where: { user_id, role_id: role.id },
      });

      if (!exists) {
        await this.db.user_role_rel.create({
          data: { user_id, role_id: role.id },
        });
      }
    }

    return { success: true, assigned_roles: roles };
  }

  async removeRoles(user_id: number, roles: string[]) {
    if (!user_id) throw new BadRequestError('user_id обязателен.');
    if (!roles || roles.length === 0) throw new BadRequestError('Необходимо указать список ролей.');

    for (const roleCode of roles) {
      const role = await this.db.roles.findFirst({ where: { code: roleCode } });
      if (role) {
        await this.db.user_role_rel.deleteMany({
          where: { user_id, role_id: role.id },
        });
      }
    }

    return { success: true, removed_roles: roles };
  }
}

export default UserRoleService;
