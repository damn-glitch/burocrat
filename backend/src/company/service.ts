// src/company/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class CompanyService {
  constructor(private db: PrismaClient) {}

  async create(dto: any, ownerId?: number) {
    validateFields(dto, ['name', 'country_code', 'industry_code', 'legal_form_code']);
    return this.db.$transaction(async (tx) => {
      const country = await tx.country.findFirstOrThrow({ where: { code: dto.country_code } });
      const industry = await tx.industry.findFirstOrThrow({ where: { code: dto.industry_code } });
      const legal_form = await tx.legal_form.findFirstOrThrow({ where: { code: dto.legal_form_code } });
      const company = await tx.company.create({
        data: {
          name: dto.name.trim(),
          code: dto.name.trim().toLowerCase().replace(/\s+/g, '_'), // todo make slug
          country_id: country.id,
          industry_id: industry.id,
          legal_form_id: legal_form.id,
          owner_id: ownerId,
          color: dto.color ?? null,
          description: dto.description ?? null,
          logo: dto.logo ?? null,
          is_active: true,
        },
      });

      // назначить владельцу роль "company_owner"
      const ownerRole = await tx.roles.upsert({
        where: { code: 'owner' },
        update: {},
        create: { name: 'Владелец компаний', code: 'owner' },
      });
      await tx.user_role_rel.upsert({
        where: { user_id_role_id: { user_id: ownerId!, role_id: ownerRole.id } },
        update: {},
        create: { user_id: ownerId!, role_id: ownerRole.id },
      });

      // связать пользователя с компанией как сотрудника (owner позиция опциональна)
      await tx.employee_company_rel.create({
        data: { user_id: ownerId!, company_id: company.id, position_id: null },
      });

      return company;
    });
  }

  async getByUser(user_id: number) {
    const companies = await this.db.company.findMany({
      where: {
        OR: [{ owner_id: user_id }, { employee_company_rel: { some: { user_id } } }],
      },
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
        description: true,
        logo: true,
        is_active: true,
        created_at: true,
        users: { select: { id: true, firstname: true, lastname: true, email: true } },
        country: { select: { id: true, name: true } },
        industry: { select: { id: true, name: true } },
        legal_form: { select: { id: true, name: true } },
      } as any,
      orderBy: { created_at: 'desc' },
    });
    return companies.map((company) => ({
      ...company,
      owner: company.users[0], // переносим users → owner
      users: undefined, // убираем оригинальное поле, чтобы не дублировать
    }));
  }

  async getAll() {
    return this.db.company.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        owner: { select: { id: true, firstname: true, lastname: true, email: true } },
        country: { select: { id: true, name: true } },
        industry: { select: { id: true, name: true } },
        legal_form: { select: { id: true, name: true } },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const company = await this.db.company.findFirstOrThrow({
      where: { id },
      include: {
        users: { select: { id: true, firstname: true, lastname: true, email: true } },
        country: { select: { id: true, name: true, code: true } },
        industry: { select: { id: true, name: true, code: true } },
        legal_form: { select: { id: true, name: true, code: true } },
        employee_company_rel: {
          select: {
            user_id: true,
            position: { select: { id: true, name: true } },
          },
        },
        project: { select: { id: true, name: true, code: true } },
      } as any,
    });
    return {
      ...company,
      owner: company.users, // переносим users → owner
      users: undefined, // убираем оригинальное поле, чтобы не дублировать
    };
  }

  async getByOwner(owner_id: number) {
    if (!owner_id) throw new BadRequestError('owner_id обязателен.');
    return this.db.company.findMany({
      where: { owner_id },
      orderBy: { created_at: 'desc' },
      include: {
        industry: { select: { id: true, name: true } },
        legal_form: { select: { id: true, name: true } },
      } as any,
    });
  }

  async update(id: number, data: any, user_id?: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const company = await this.db.company.findFirstOrThrow({
      where: { id },
      select: {
        users: { select: { id: true } },
        name: true,
        code: true,
        color: true,
        description: true,
        logo: true,
        is_active: true,
        country_id: true,
        industry_id: true,
        legal_form_id: true,
      },
    });
    if (company.users?.id != user_id) {
      throw new BadRequestError('Нет прав на изменение этой компании.');
    }
    const updated = await this.db.company.update({
      where: { id },
      data: {
        name: data.name ?? company.name,
        code: data.code ?? company.code,
        color: data.color ?? company.color,
        description: data.description ?? company.description,
        logo: data.logo ?? company.logo,
        is_active: data.is_active ?? company.is_active,
        country_id: data.country_id ?? company.country_id,
        industry_id: data.industry_id ?? company.industry_id,
        legal_form_id: data.legal_form_id ?? company.legal_form_id,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.company.delete({ where: { id } });
    return { success: true };
  }

  async activate(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const company = await this.db.company.findUnique({ where: { id } });
    if (!company) throw new BadRequestError('Компания не найдена.');

    if (company.is_active) return { success: true, message: 'Компания уже активна.' };

    await this.db.company.update({
      where: { id },
      data: { is_active: true },
    });

    return { success: true, message: 'Компания активирована.' };
  }

  async deactivate(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const company = await this.db.company.findUnique({ where: { id } });
    if (!company) throw new BadRequestError('Компания не найдена.');

    if (!company.is_active) return { success: true, message: 'Компания уже неактивна.' };

    await this.db.company.update({
      where: { id },
      data: { is_active: false },
    });

    return { success: true, message: 'Компания деактивирована.' };
  }
}

export default CompanyService;
