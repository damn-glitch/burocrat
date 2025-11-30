// src/invitation/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';
import { randomUUID } from 'crypto';
import { addDays } from 'date-fns';

class InvitationService {
  constructor(private db: PrismaClient) {}

  async createInvite(companyId: number, invitedBy: number, email: string, positionId?: number) {
    // RBAC: requirePerm('company:invite')
    const token = crypto.randomUUID();
    const expires = addDays(new Date(), 7);

    const inv = await this.db.invitation.create({
      data: {
        email: email.toLowerCase(),
        token,
        position_id: positionId ?? null,
        user_id: null,
        company_id: companyId,
        invited_by: invitedBy,
        expires_at: expires,
        status: 'pending',
      },
    });

    // отправка письма с link: /invite/accept?token=...
    return { token: inv.token, expires_at: inv.expires_at };
  }

  async create(data: any, invitedBy: number | null) {
    validateFields(data, ['email', 'company_id']);

    const company = await this.db.company.findUnique({ where: { id: data.company_id } });
    if (!company) throw new BadRequestError('Компания не найдена');

    if (data.user_id) {
      const user = await this.db.users.findUnique({ where: { id: data.user_id } });
      if (!user) throw new BadRequestError('Пользователь не найден');
    }

    if (data.position_id) {
      const position = await this.db.position.findUnique({ where: { id: data.position_id } });
      if (!position) throw new BadRequestError('Должность не найдена');
    }

    const existing = await this.db.invitation.findFirst({
      where: {
        email: data.email,
        company_id: data.company_id,
        status: 'pending',
      },
    });
    if (existing) throw new BadRequestError('Приглашение уже отправлено этому пользователю.');

    const invitation = await this.db.invitation.create({
      data: {
        email: data.email.trim().toLowerCase(),
        token: randomUUID(),
        position_id: data.position_id ?? null,
        user_id: data.user_id ?? null,
        company_id: data.company_id,
        invited_by: invitedBy,
        status: 'pending',
        expires_at: data.expires_at ? new Date(data.expires_at) : null,
      },
    });

    return { success: true, invitation };
  }

  async getAll() {
    return this.db.invitation.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        company: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
        invited_by_user: { select: { id: true, firstname: true, lastname: true } },
        user: { select: { id: true, email: true } },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const inv = await this.db.invitation.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
        invited_by_user: { select: { id: true, firstname: true, lastname: true } },
      } as any,
    });
    if (!inv) throw new BadRequestError('Приглашение не найдено.');
    return inv;
  }

  async getByCompany(company_id: number) {
    if (!company_id) throw new BadRequestError('company_id обязателен.');
    return this.db.invitation.findMany({
      where: { company_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async getByStatus(status: string) {
    if (!status) throw new BadRequestError('Статус обязателен.');
    return this.db.invitation.findMany({
      where: { status },
      orderBy: { created_at: 'desc' },
    });
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const inv = await this.db.invitation.findUnique({ where: { id } });
    if (!inv) throw new BadRequestError('Приглашение не найдено.');

    const updated = await this.db.invitation.update({
      where: { id },
      data: {
        email: data.email ?? inv.email,
        position_id: data.position_id ?? inv.position_id,
        user_id: data.user_id ?? inv.user_id,
        company_id: data.company_id ?? inv.company_id,
        status: data.status ?? inv.status,
        expires_at: data.expires_at ? new Date(data.expires_at) : inv.expires_at,
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.invitation.delete({ where: { id } });
    return { success: true };
  }

  async accept(id: number) {
    const inv = await this.db.invitation.findUnique({ where: { id } });
    if (!inv) throw new BadRequestError('Приглашение не найдено.');
    if (inv.status !== 'pending') throw new BadRequestError('Приглашение уже обработано.');

    await this.db.invitation.update({
      where: { id },
      data: { status: 'accepted' },
    });

    return { success: true, status: 'accepted' };
  }

  async decline(id: number) {
    const inv = await this.db.invitation.findUnique({ where: { id } });
    if (!inv) throw new BadRequestError('Приглашение не найдено.');
    if (inv.status !== 'pending') throw new BadRequestError('Приглашение уже обработано.');

    await this.db.invitation.update({
      where: { id },
      data: { status: 'declined' },
    });

    return { success: true, status: 'declined' };
  }
}

export default InvitationService;
