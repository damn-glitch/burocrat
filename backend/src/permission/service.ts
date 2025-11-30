// src/permission/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class PermissionService {
  constructor(private db: PrismaClient) {}

  async create(data: any) {
    validateFields(data, ['name', 'code']);

    const exists = await this.db.permissions.findFirst({
      where: { OR: [{ name: data.name.trim() }, { code: data.code.trim() }] },
    });
    if (exists) throw new BadRequestError('Разрешение с таким именем или кодом уже существует.');

    const permission = await this.db.permissions.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim(),
        description: data.description ?? null,
      },
    });

    return { success: true, permission };
  }

  async getAll() {
    return this.db.permissions.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        role_permission_rel: {
          select: { role_id: true },
        },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const permission = await this.db.permissions.findUnique({
      where: { id },
      include: {
        role_permission_rel: {
          include: {
            roles: { select: { id: true, name: true, code: true } },
          },
        },
      } as any,
    });
    if (!permission) throw new BadRequestError('Разрешение не найдено.');
    return permission;
  }

  async getByCode(code: string) {
    if (!code) throw new BadRequestError('Код обязателен.');
    const permission = await this.db.permissions.findFirst({
      where: { code },
      include: {
        role_permission_rel: {
          include: {
            roles: { select: { id: true, name: true } },
          },
        },
      } as any,
    });
    if (!permission) throw new BadRequestError('Разрешение не найдено.');
    return permission;
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const permission = await this.db.permissions.findUnique({ where: { id } });
    if (!permission) throw new BadRequestError('Разрешение не найдено.');

    const updated = await this.db.permissions.update({
      where: { id },
      data: {
        name: data.name ?? permission.name,
        code: data.code ?? permission.code,
        description: data.description ?? permission.description,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');

    const linked = await this.db.role_permission_rel.findFirst({ where: { permission_id: id } });
    if (linked) throw new BadRequestError('Разрешение используется в одной или нескольких ролях.');

    await this.db.permissions.delete({ where: { id } });
    return { success: true };
  }
}

export default PermissionService;
