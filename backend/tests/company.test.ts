import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app'; // твой основной express app
import jwt from 'jsonwebtoken';

const db = new PrismaClient();

// утилита для генерации токена
const genToken = (userId: number) =>
  jwt.sign(
    {
      id: userId,
      user_id: userId,
    },
    process.env.SECRET_KEY_JWT || 'test-secret',
  );

describe('🔐 Company Routes (Authorized)', () => {
  let tokenOwner: string;
  let tokenOther: string;
  let createdCompanyId: number;

  beforeAll(async () => {
    // создаем пользователей напрямую в базе
    const owner = await db.users.create({
      data: {
        firstname: 'Owner',
        lastname: 'Test',
        phone: '1233454365',
        email: 'owner@test.com',
        username: 'Owner',
        password_hash: '123',
      },
    });
    const other = await db.users.create({
      data: {
        firstname: 'Other',
        lastname: 'User',
        phone: '1233454367',
        email: 'other@test.com',
        username: 'Other',
        password_hash: '123',
      },
    });

    tokenOwner = `Bearer ${genToken(owner.id)}`;
    tokenOther = `Bearer ${genToken(other.id)}`;
  });

  afterAll(async () => {
    await db.company.deleteMany({ where: { name: 'Test Company' } });
    await db.users.deleteMany({ where: { username: { in: ['Owner', 'Other'] } } });
    await db.$disconnect();
  });

  // ---------- Создание ----------
  it('✅ Создание компании владельцем', async () => {
    const res = await request(app).post('/company').set('Authorization', tokenOwner).send({
      name: 'Test Company',
      country_code: 'KZ',
      industry_code: 'agriculture',
      legal_form_code: 'investment-fund',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Company');
    createdCompanyId = res.body.id;
  });

  // ---------- Изменение ----------
  it('✅ Владелец может изменить информацию о компании', async () => {
    const res = await request(app)
      .put(`/company/${createdCompanyId}`)
      .set('Authorization', tokenOwner)
      .send({ name: 'Updated Company Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.updated.name).toBe('Updated Company Name');
  });

  it('🚫 Другой пользователь не может изменить компанию', async () => {
    const res = await request(app)
      .put(`/company/${createdCompanyId}`)
      .set('Authorization', tokenOther)
      .send({ name: 'Malicious Update' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message || res.body.error).toMatch(/Нет прав/i);
  });

  // ---------- Активация / Деактивация ----------
  it('✅ Владелец может деактивировать компанию', async () => {
    const res = await request(app).put(`/company/${createdCompanyId}/deactivate`).set('Authorization', tokenOwner);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/деактив/i);
  });

  it('✅ Владелец может снова активировать компанию', async () => {
    const res = await request(app).put(`/company/${createdCompanyId}/activate`).set('Authorization', tokenOwner);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/актив/i);
  });

  // ---------- Получение ----------
  it('✅ Владелец может получить список своих компаний', async () => {
    const res = await request(app).get('/company/my').set('Authorization', tokenOwner);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ---------- Удаление ----------
  it('✅ Владелец может удалить компанию', async () => {
    const res = await request(app).delete(`/company/${createdCompanyId}`).set('Authorization', tokenOwner);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
