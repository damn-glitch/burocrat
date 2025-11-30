import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app';
import jwt from 'jsonwebtoken';

const db = new PrismaClient();

const genToken = (userId: number) =>
  jwt.sign({ id: userId, user_id: userId }, process.env.SECRET_KEY_JWT || 'test-secret');

describe('🚀 Project Routes (Authorized, via Company API)', () => {
  let tokenOwner: string;
  let tokenOther: string;
  let companyId: number;
  let projectId: number;

  beforeAll(async () => {
    // создаём пользователей
    const owner = await db.users.create({
      data: {
        firstname: 'ProjectOwner',
        lastname: 'Test',
        phone: '9999999999',
        email: 'project_owner@test.com',
        username: 'ProjOwner',
        password_hash: '123',
      },
    });
    const other = await db.users.create({
      data: {
        firstname: 'Other',
        lastname: 'Tester',
        phone: '8888888888',
        email: 'project_other@test.com',
        username: 'ProjOther',
        password_hash: '123',
      },
    });

    tokenOwner = `Bearer ${genToken(owner.id)}`;
    tokenOther = `Bearer ${genToken(other.id)}`;

    // создаём справочники (чтобы пройти FK проверки)
    const country = await db.country.upsert({
      where: { code: 'KZ' },
      update: {},
      create: { name: 'Казахстан', code: 'KZ' },
    });
    const industry = await db.industry.upsert({
      where: { code: 'agriculture' },
      update: {},
      create: { name: 'Сельское хозяйство', code: 'agriculture' },
    });
    const legalForm = await db.legal_form.upsert({
      where: { code: 'investment-fund' },
      update: {},
      create: { name: 'Инвестиционный фонд', code: 'investment-fund' },
    });

    // создаём компанию через API (НЕ напрямую в БД)
    const resCompany = await request(app)
      .post('/company')
      .set('Authorization', tokenOwner)
      .send({
        name: 'Company for Projects',
        country_code: country.code,
        industry_code: industry.code,
        legal_form_code: legalForm.code,
      });

    expect(resCompany.statusCode).toBe(200);
    companyId = resCompany.body.id;
  });

  afterAll(async () => {
    await db.project.deleteMany({ where: { company_id: companyId } });
    await db.company.deleteMany({ where: { id: companyId } });
    await db.users.deleteMany({
      where: { username: { in: ['ProjOwner', 'ProjOther'] } },
    });
    await db.$disconnect();
  });

  // ---------- Создание ----------
  it('✅ Владелец компании может создать проект', async () => {
    const res = await request(app)
      .post('/project')
      .set('Authorization', tokenOwner)
      .send({
        name: 'My First Project',
        company_id: companyId,
        description: 'This is a test project',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('My First Project');
    projectId = res.body.id;
  });

  it('🚫 Не может создать проект без company_id', async () => {
    const res = await request(app)
      .post('/project')
      .set('Authorization', tokenOwner)
      .send({
        name: 'Invalid Project',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error || res.body.message).toMatch(/company_id/i);
  });

  // ---------- Изменение ----------
  it('✅ Владелец проекта может изменить описание', async () => {
    const res = await request(app)
      .put(`/project/${projectId}`)
      .set('Authorization', tokenOwner)
      .send({ description: 'Updated description' });

    expect(res.statusCode).toBe(200);
    expect(res.body.updated.description).toBe('Updated description');
  });

  it('🚫 Другой пользователь не может изменить проект', async () => {
    const res = await request(app)
      .put(`/project/${projectId}`)
      .set('Authorization', tokenOther)
      .send({ description: 'Hack attempt' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message || res.body.error).toMatch(/Нет прав/i);
  });

  // ---------- Получение ----------
  it('✅ Владелец может получить список своих проектов', async () => {
    const res = await request(app).get('/project/my').set('Authorization', tokenOwner);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('✅ Можно получить проект по ID', async () => {
    const res = await request(app).get(`/project/${projectId}`).set('Authorization', tokenOwner);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(projectId);
  });

  // ---------- Новый тест: получение проектов по ID компании ----------
  it('✅ Можно получить проект по ID компании', async () => {
    const res = await request(app)
      .get(`/project/company/${companyId}`)
      .set('Authorization', tokenOwner);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('company');
    expect(res.body.company.id).toBe(companyId);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
  });

  // ---------- Удаление ----------
  it('✅ Владелец может удалить проект', async () => {
    const res = await request(app).delete(`/project/${projectId}`).set('Authorization', tokenOwner);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('🚫 Другой пользователь не может удалить проект', async () => {
    // создаем новый проект владельцем
    const resProject = await request(app)
      .post('/project')
      .set('Authorization', tokenOwner)
      .send({
        name: 'Temp Project',
        company_id: companyId,
        description: 'temp',
      });

    const project = resProject.body;
    expect(project.id).toBeDefined();

    const res = await request(app).delete(`/project/${project.id}`).set('Authorization', tokenOther);

    expect(res.statusCode).toBe(400);
    expect(res.body.message || res.body.error).toMatch(/Нет прав/i);
  });
});
