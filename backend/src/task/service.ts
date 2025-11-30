// src/task/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class TaskService {
  constructor(private db: PrismaClient) {}

  private async logChange(task: any, userId?: number) {
    await this.db.task_log.create({
      data: {
        task_id: task.id,
        name: task.name,
        path: task.path,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        project_id: task.project_id,
        assignee_id: task.assignee_id,
        manager_id: task.manager_id,
      },
    });
  }

  async create(data: any) {
    validateFields(data, ['name', 'path', 'status', 'priority', 'project_id']);

    const project = await this.db.project.findUnique({ where: { id: data.project_id } });
    if (!project) throw new BadRequestError('Проект не найден.');

    if (data.assignee_id) {
      const assignee = await this.db.users.findUnique({ where: { id: data.assignee_id } });
      if (!assignee) throw new BadRequestError('Исполнитель не найден.');
    }

    if (data.manager_id) {
      const manager = await this.db.users.findUnique({ where: { id: data.manager_id } });
      if (!manager) throw new BadRequestError('Менеджер не найден.');
    }

    const task = await this.db.task.create({
      data: {
        name: data.name.trim(),
        path: data.path.trim(),
        description: data.description ?? null,
        status: data.status.trim(),
        priority: data.priority.trim(),
        due_date: data.due_date ? new Date(data.due_date) : null,
        project_id: data.project_id,
        assignee_id: data.assignee_id ?? null,
        manager_id: data.manager_id ?? null,
      },
    });

    await this.logChange(task);

    return { success: true, task };
  }

  async getAll() {
    return this.db.task.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstname: true, lastname: true } },
        manager: { select: { id: true, firstname: true, lastname: true } },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const task = await this.db.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstname: true, lastname: true } },
        manager: { select: { id: true, firstname: true, lastname: true } },
      } as any,
    });
    if (!task) throw new BadRequestError('Задача не найдена.');
    return task;
  }

  async getByProject(project_id: number) {
    if (!project_id) throw new BadRequestError('project_id обязателен.');
    return this.db.task.findMany({
      where: { project_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async getByAssignee(assignee_id: number) {
    if (!assignee_id) throw new BadRequestError('assignee_id обязателен.');
    return this.db.task.findMany({
      where: { assignee_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async getByManager(manager_id: number) {
    if (!manager_id) throw new BadRequestError('manager_id обязателен.');
    return this.db.task.findMany({
      where: { manager_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const task = await this.db.task.findUnique({ where: { id } });
    if (!task) throw new BadRequestError('Задача не найдена.');

    const updated = await this.db.task.update({
      where: { id },
      data: {
        name: data.name ?? task.name,
        path: data.path ?? task.path,
        description: data.description ?? task.description,
        status: data.status ?? task.status,
        priority: data.priority ?? task.priority,
        due_date: data.due_date ? new Date(data.due_date) : task.due_date,
        project_id: data.project_id ?? task.project_id,
        assignee_id: data.assignee_id ?? task.assignee_id,
        manager_id: data.manager_id ?? task.manager_id,
      },
    });

    await this.logChange(updated);

    return { success: true, updated };
  }

  async changeStatus(id: number, status: string) {
    const task = await this.db.task.findUnique({ where: { id } });
    if (!task) throw new BadRequestError('Задача не найдена.');

    const updated = await this.db.task.update({
      where: { id },
      data: { status },
    });

    await this.logChange(updated);
    return { success: true, message: `Статус задачи обновлён на "${status}"` };
  }

  async changePriority(id: number, priority: string) {
    const task = await this.db.task.findUnique({ where: { id } });
    if (!task) throw new BadRequestError('Задача не найдена.');

    const updated = await this.db.task.update({
      where: { id },
      data: { priority },
    });

    await this.logChange(updated);
    return { success: true, message: `Приоритет задачи обновлён на "${priority}"` };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.task.delete({ where: { id } });
    return { success: true };
  }
}

export default TaskService;
