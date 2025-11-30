// src/role/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class RoleService {
  constructor(private db: PrismaClient) {}

  async create(data: any) {
    validateFields(data, ['name']);

    const existing = await this.db.roles.findFirst({
      where: { name: data.name.trim() },
    });
    if (existing) throw new BadRequestError('Роль с таким именем уже существует.');

    const role = await this.db.roles.create({
      data: {
        name: data.name.trim(),
        description: data.description ?? null,
        code: data.code ?? null,
      },
    });

    return { success: true, role };
  }

  async getAll() {
    return this.db.roles.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        role_permission_rel: {
          include: { permissions: { select: { id: true, name: true, code: true } } },
        },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const role = await this.db.roles.findUnique({
      where: { id },
      include: {
        role_permission_rel: {
          include: { permissions: { select: { id: true, name: true, code: true } } },
        },
      } as any,
    });
    if (!role) throw new BadRequestError('Роль не найдена.');
    return role;
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const role = await this.db.roles.findUnique({ where: { id } });
    if (!role) throw new BadRequestError('Роль не найдена.');

    const updated = await this.db.roles.update({
      where: { id },
      data: {
        name: data.name ?? role.name,
        description: data.description ?? role.description,
        code: data.code ?? role.code,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.roles.delete({ where: { id } });
    return { success: true };
  }

  async assignPermissions(roleId: number, permissionCodes: string[]) {
    if (!roleId) throw new BadRequestError('roleId обязателен.');
    if (!Array.isArray(permissionCodes) || permissionCodes.length === 0)
      throw new BadRequestError('permissions — обязательный массив.');

    const role = await this.db.roles.findUnique({ where: { id: roleId } });
    if (!role) throw new BadRequestError('Роль не найдена.');

    for (const code of permissionCodes) {
      const perm = await this.db.permissions.findFirst({ where: { code } });
      if (!perm) throw new BadRequestError(`Разрешение "${code}" не найдено`);

      const exists = await this.db.role_permission_rel.findFirst({
        where: { role_id: roleId, permission_id: perm.id },
      });

      if (!exists) {
        await this.db.role_permission_rel.create({
          data: { role_id: roleId, permission_id: perm.id },
        });
      }
    }

    return { success: true, assigned: permissionCodes };
  }

  async removePermissions(roleId: number, permissionCodes: string[]) {
    if (!roleId) throw new BadRequestError('roleId обязателен.');
    if (!Array.isArray(permissionCodes) || permissionCodes.length === 0)
      throw new BadRequestError('permissions — обязательный массив.');

    const role = await this.db.roles.findUnique({ where: { id: roleId } });
    if (!role) throw new BadRequestError('Роль не найдена.');

    for (const code of permissionCodes) {
      const perm = await this.db.permissions.findFirst({ where: { code } });
      if (perm) {
        await this.db.role_permission_rel.deleteMany({
          where: { role_id: roleId, permission_id: perm.id },
        });
      }
    }

    return { success: true, removed: permissionCodes };
  }
}

export default RoleService;
