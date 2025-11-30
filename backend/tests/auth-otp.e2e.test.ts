/**
 * tests/auth-otp.e2e.test.ts
 */
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '@src/app'; // убедись, что app экспортируется как default
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
// TS2593: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha` and then add 'jest' or 'mocha' to the types field in your tsconfig.
describe('🔐 Registration → OTP verify (phone) → Reset password (email)', () => {
  let userId: number;
  const phone = '+77771234567';
  const email = 'testuser@example.com';
  let otpCode: string;

  beforeAll(async () => {
    // чистим только наши данные
    await prisma.otp.deleteMany({});
    await prisma.users.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1️⃣ Register new user (inactive)', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstname: 'Test',
        lastname: 'User',
        username: email,
        email,
        phone,
        password: 'Secret123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.is_active).toBe(false);

    userId = res.body.user.id;
    const userInDb = await prisma.users.findUnique({ where: { id: userId } });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.is_active).toBe(false);
  });

  test('2️⃣ Generate OTP for phone verification (WhatsApp)', async () => {
    const res = await request(app)
      .post('/otp/generate')
      .send({
        user_id: userId,
        type: 'whatsapp',
        action: 'verify',
      });

    expect(res.status).toBe(201);
    expect(res.body.success || res.body.ok).toBe(true);

    const otp = await prisma.otp.findFirst({
      where: { user_id: userId, action: 'verify', is_used: false },
      orderBy: { created_at: 'desc' },
    });

    expect(otp).toBeTruthy();
    expect(otp?.code).toMatch(/^\d{6}$/);
    otpCode = otp!.code;
  });

  test('3️⃣ Verify OTP and activate user', async () => {
    const res = await request(app)
      .post('/otp/verify')
      .send({
        user_id: userId,
        code: otpCode,
        action: 'verify',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await prisma.users.findUnique({ where: { id: userId } });
    expect(updatedUser?.is_active).toBe(true);
  });

  test('4️⃣ Generate OTP for password reset (email)', async () => {
    const res = await request(app)
      .post('/otp/generate')
      .send({
        user_id: userId,
        type: 'email',
        action: 'reset_password',
      });

    expect(res.status).toBe(201);
    expect(res.body.success || res.body.ok).toBe(true);

    const otp = await prisma.otp.findFirst({
      where: { user_id: userId, action: 'reset_password', is_used: false },
      orderBy: { created_at: 'desc' },
    });

    expect(otp).toBeTruthy();
    otpCode = otp!.code;
  });

  test('5️⃣ Verify OTP and reset password', async () => {
    const res = await request(app)
      .post('/otp/verify')
      .send({
        user_id: userId,
        code: otpCode,
        action: 'reset_password',
        new_password: 'NewSecret123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await prisma.users.findUnique({ where: { id: userId } });
    expect(updatedUser).toBeTruthy();
    const ok = await bcrypt.compare('NewSecret123!', updatedUser!.password_hash);
    expect(ok).toBe(true);
  });

  test('6️⃣ Login with new password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        identifier: email,
        password: 'NewSecret123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.user?.id).toBe(userId);
  });
});
