// src/employee_company/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class EmployeeCompanyService {
  constructor(private db: PrismaClient) {}

  async create(data: any) {
    validateFields(data, ['user_id', 'company_id']);

    const user = await this.db.users.findUnique({ where: { id: data.user_id } });
    if (!user) throw new BadRequestError('Пользователь не найден');

    const company = await this.db.company.findUnique({ where: { id: data.company_id } });
    if (!company) throw new BadRequestError('Компания не найдена');

    if (data.position_id) {
      const position = await this.db.position.findUnique({ where: { id: data.position_id } });
      if (!position) throw new BadRequestError('Должность не найдена');
    }

    const existing = await this.db.employee_company_rel.findFirst({
      where: { user_id: data.user_id, company_id: data.company_id },
    });
    if (existing) throw new BadRequestError('Этот пользователь уже привязан к компании');

    const rel = await this.db.employee_company_rel.create({
      data: {
        user_id: data.user_id,
        company_id: data.company_id,
        position_id: data.position_id ?? null,
      },
    });

    return { success: true, employee_company_rel: rel };
  }

  async getAll() {
    return this.db.employee_company_rel.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, firstname: true, lastname: true, email: true } },
        company: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const rel = await this.db.employee_company_rel.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstname: true, lastname: true, email: true } },
        company: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
      } as any,
    });
    if (!rel) throw new BadRequestError('Связь сотрудника и компании не найдена.');
    return rel;
  }

  async getByCompany(company_id: number) {
    if (!company_id) throw new BadRequestError('company_id обязателен.');
    return this.db.employee_company_rel.findMany({
      where: { company_id },
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, firstname: true, lastname: true, email: true } },
        position: { select: { id: true, name: true } },
      } as any,
    });
  }

  async getByUser(user_id: number) {
    if (!user_id) throw new BadRequestError('user_id обязателен.');
    return this.db.employee_company_rel.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
      include: {
        company: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
      } as any,
    });
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const rel = await this.db.employee_company_rel.findUnique({ where: { id } });
    if (!rel) throw new BadRequestError('Связь не найдена.');

    const updated = await this.db.employee_company_rel.update({
      where: { id },
      data: {
        user_id: data.user_id ?? rel.user_id,
        company_id: data.company_id ?? rel.company_id,
        position_id: data.position_id ?? rel.position_id,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.employee_company_rel.delete({ where: { id } });
    return { success: true };
  }
}

export default EmployeeCompanyService;
