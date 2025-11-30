// src/project/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class ProjectService {
  constructor(private db: PrismaClient) {}

  /**
   * Создание проекта
   */
  async create(dto: any, ownerId?: number) {
    validateFields(dto, ['name', 'company_id']);

    return this.db.$transaction(async (tx) => {
      const company = await tx.company.findUnique({ where: { id: dto.company_id } });
      if (!company) throw new BadRequestError('Компания не найдена');

      const existing = await tx.project.findFirst({
        where: { name: dto.name.trim(), company_id: dto.company_id },
      });
      if (existing) throw new BadRequestError('Проект с таким названием уже существует в этой компании');

      const project = await tx.project.create({
        data: {
          name: dto.name.trim(),
          code: dto.name.trim().toLowerCase().replace(/\s+/g, '_'), // todo: make slug util
          description: dto.description ?? null,
          color: dto.color ?? null,
          company_id: dto.company_id,
          owner_id: ownerId!,
        },
      });

      // Назначить владельцу роль project_owner
      const projectOwnerRole = await tx.roles.upsert({
        where: { code: 'project_owner' },
        update: {},
        create: { name: 'Владелец проектов', code: 'project_owner' },
      });

      await tx.user_role_rel.upsert({
        where: { user_id_role_id: { user_id: ownerId!, role_id: projectOwnerRole.id } },
        update: {},
        create: { user_id: ownerId!, role_id: projectOwnerRole.id },
      });

      // Связать владельца с проектом (как участника)
      await tx.employee_project_rel.create({
        data: { user_id: ownerId!, project_id: project.id, position_id: null },
      });

      return project;
    });
  }

  /**
   * Получение всех проектов
   */
  async getAll(user_id: number) {
    return this.db.project.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        company: { select: { id: true, name: true } },
        owner: { select: { id: true, firstname: true, lastname: true, email: true } },
      } as any,
    });
  }

  /**
   * Получение проекта по ID
   */
  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const project = await this.db.project.findFirstOrThrow({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        users: { select: { id: true, firstname: true, lastname: true, email: true } },
        employee_project_rel: {
          select: {
            user_id: true,
            position: { select: { id: true, name: true } },
          },
        },
      } as any,
    });

    return project;
  }

  /**
   * Получение проекта по ID компании
   */
  async getByCompany(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const projects = await this.db.project.findMany({
      where: { company_id: id },
      include: {
        company: { select: { id: true, name: true } },
        users: { select: { id: true, firstname: true, lastname: true, email: true } },
        employee_project_rel: {
          select: {
            user_id: true,
            users: { select: { id: true, firstname: true, lastname: true, email: true } },
            position: { select: { id: true, name: true } },
          },
        },
      } as any,
    });

    return projects;
  }

  /**
   * Получить все проекты по пользователю
   */
  async getByUser(user_id: number) {
    const projects = await this.db.project.findMany({
      where: {
        OR: [
          { owner_id: user_id }, // ✅ владелец
          { employee_project_rel: { some: { user_id } } }, // ✅ участник
        ],
      },
      orderBy: { created_at: 'desc' },
      include: {
        company: { select: { id: true, name: true } },
        users: { select: { id: true, firstname: true, lastname: true, email: true } }, // владелец
        employee_project_rel: {
          include: {
            users: { select: { id: true, firstname: true, lastname: true, email: true } }, // участники
          },
        },
      },
    });

    // трансформируем поле users → owner и собираем участников
    return projects.map((p) => ({
      ...p,
      owner: p.users,
      participants: p.employee_project_rel.map((r) => r.users),
    }));
  }

  /**
   * Обновление проекта
   */
  async update(id: number, data: any, user_id?: number) {
    if (!id) throw new BadRequestError('ID обязателен.');

    const project = await this.db.project.findFirstOrThrow({
      where: { id },
      select: {
        owner_id: true,
        name: true,
        code: true,
        color: true,
        description: true,
        company_id: true,
      },
    });

    if (project.owner_id !== user_id) {
      throw new BadRequestError('Нет прав на изменение этого проекта.');
    }

    const updated = await this.db.project.update({
      where: { id },
      data: {
        name: data.name ?? project.name,
        code: data.code ?? project.code,
        color: data.color ?? project.color,
        description: data.description ?? project.description,
        company_id: data.company_id ?? project.company_id,
      },
    });

    return { success: true, updated };
  }

  /**
   * Удаление проекта
   */
  async delete(id: number, user_id?: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const project = await this.db.project.findUnique({ where: { id } });
    if (!project) throw new BadRequestError('Проект не найден.');
    if (project.owner_id !== user_id) throw new BadRequestError('Нет прав на удаление.');

    await this.db.project.delete({ where: { id } });
    return { success: true };
  }
}

export default ProjectService;
