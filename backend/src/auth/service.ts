// src/auth/service.ts
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TTL: string = process.env.ACCESS_TTL || '30m';
const SECRET: Secret = process.env.SECRET_KEY_JWT as string;

class TokenService {
  signAccess(payload: any) {
    return jwt.sign(payload, SECRET, { expiresIn: ACCESS_TTL } as SignOptions);
  }

  generateRefresh() {
    return crypto.randomBytes(48).toString('hex');
  }
}

export default class AuthService {
  private tokens: TokenService;

  constructor(private db: PrismaClient) {
    this.tokens = new TokenService();
  }

  async register(dto: any) {
    validateFields(dto, [/*'email',*/ 'phone', 'password', 'firstname', 'lastname']);
    dto.username = dto.username || dto.email;

    const exists = await this.db.users.findFirst({
      where: { OR: [{ email: dto.email?.toLowerCase() }, { phone: dto.phone }, { username: dto.username }] },
      select: { id: true },
    });
    if (exists) throw new BadRequestError('User already exists');

    const password_hash = await bcrypt.hash(dto.password, 12);

    const user = await this.db.users.create({
      data: {
        firstname: dto.firstname,
        lastname: dto.lastname,
        username: dto.username,
        phone: dto.phone,
        email: dto.email?.toLowerCase(),
        password_hash,
        is_active: false,
      },
    });

    const perms = await this.collectPermissions(user.id);
    const access_token = this.tokens.signAccess({ user_id: user.id, perms });
    const refresh_token = this.tokens.generateRefresh();

    await this.db.refresh_token.create({
      data: {
        user_id: user.id,
        token: refresh_token,
        user_agent: dto.userAgent,
        ip: dto.ip,
        expires_at: addDays(new Date(), 30),
      },
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        is_active: false,
        perms,
      },
    };
  }

  async login({
    identifier,
    password,
    userAgent,
    ip,
  }: {
    identifier: string;
    password: string;
    userAgent?: string;
    ip?: string;
  }) {
    validateFields({ identifier, password }, ['identifier', 'password']);
    const user = await this.db.users.findFirst({
      where: { OR: [{ email: identifier.toLowerCase() }, { username: identifier }, { phone: identifier }] },
    });
    if (!user || !user.is_active) throw new BadRequestError('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      await this.db.users.update({ where: { id: user.id }, data: { login_attempts: { increment: 1 } } });
      // при необходимости — блокировка при N попытках
      throw new BadRequestError('Invalid credentials');
    }

    const perms = await this.collectPermissions(user.id);
    const access_token = this.tokens.signAccess({ user_id: user.id, perms });
    const refresh_token = this.tokens.generateRefresh();

    await this.db.refresh_token.create({
      data: {
        user_id: user.id,
        token: refresh_token,
        user_agent: userAgent,
        ip,
        expires_at: addDays(new Date(), 30),
      },
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
        perms,
      },
    };
  }

  async refresh({ refresh_token }: { refresh_token: string }) {
    const rt = await this.db.refresh_token.findUnique({ where: { token: refresh_token } });
    if (!rt || rt.expires_at < new Date()) throw new BadRequestError('Refresh expired');

    const user = await this.db.users.findUnique({ where: { id: rt.user_id } });
    if (!user) throw new BadRequestError('User missing');

    const perms = await this.collectPermissions(user.id);
    const access_token = this.tokens.signAccess({ sub: user.id, perms });
    return { access_token, user: { id: user.id, email: user.email, username: user.username, perms } };
  }

  async logout({ refresh_token }: { refresh_token: string }) {
    await this.db.refresh_token.delete({ where: { token: refresh_token } }).catch(() => {});
    return { ok: true };
  }

  private async collectPermissions(userId: number) {
    // DDL: user_role_rel -> role_permission_rel -> permissions
    const roles = await this.db.user_role_rel.findMany({
      where: { user_id: userId },
      include: { roles: { include: { role_permission_rel: { include: { permissions: true } } } } },
    });
    const set = new Set<string>();
    roles.forEach((r) => r.roles.role_permission_rel.forEach((rp) => set.add(rp.permissions.code!)));
    return Array.from(set);
  }
}
