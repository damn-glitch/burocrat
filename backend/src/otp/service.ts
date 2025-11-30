import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';
import { randomInt } from 'crypto';
import { addMinutes } from 'date-fns';
import axios from 'axios';
import nodemailer from 'nodemailer';

class OTPService {
  constructor(private db: PrismaClient) {}

  // ───────────────────────────────────────────────
  // 🔢 Генерация случайного кода
  private generateCode(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return String(randomInt(min, max));
  }

  // ───────────────────────────────────────────────
  // 🧩 Генерация OTP с учётом типа действия
  async generate(data: any) {
    validateFields(data, ['user_id', 'type', 'action']);

    const allowedActions = ['verify', 'reset_password', 'change_phone', 'change_email'];
    if (!allowedActions.includes(data.action))
      throw new BadRequestError(`Недопустимое действие. Разрешено: ${allowedActions.join(', ')}`);

    const user = await this.db.users.findUnique({ where: { id: data.user_id } });
    if (!user) throw new BadRequestError('Пользователь не найден.');

    // 🔎 Валидация действий в зависимости от типа action
    switch (data.action) {
      case 'verify':
        if (user.is_active) throw new BadRequestError('Пользователь уже подтверждён.');
        break;
      case 'reset_password':
        // if (!user.email) throw new BadRequestError('Для сброса пароля требуется email.');
        break;
      case 'change_phone':
        if (!data.new_phone) throw new BadRequestError('Не указан новый номер телефона для подтверждения.');
        break;
      case 'change_email':
        if (!data.new_email) throw new BadRequestError('Не указан новый email для подтверждения.');
        break;
    }

    const code = this.generateCode(6);
    const expires_at = addMinutes(new Date(), 10); // 10 минут жизни кода

    // 🧹 Деактивация старых OTP для того же действия
    await this.db.otp.updateMany({
      where: { user_id: data.user_id, action: data.action, is_used: false },
      data: { is_used: true },
    });

    // 💾 Создаём новый OTP
    const otp = await this.db.otp.create({
      data: {
        user_id: user.id,
        code,
        type: data.type.trim(),
        action: data.action.trim(),
        expires_at,
      },
    });

    // 🚀 Отправляем код пользователю
    if (data.type === 'whatsapp' && user.phone) {
      await this.sendOtpViaWhatsApp(user.phone, code, data.action);
    } else if (data.type === 'email' && user.email) {
      await this.sendOtpViaEmail(user.email, code, data.action);
    } else {
      throw new BadRequestError('Невозможно отправить OTP — нет контактных данных.');
    }

    return {
      success: true,
      message: `OTP для действия "${data.action}" успешно создан и отправлен.`,
      otp: { id: otp.id, expires_at },
    };
  }

  // ───────────────────────────────────────────────
  // ✅ Проверка кода и выполнение действия
  async verify(data: any) {
    validateFields(data, ['user_id', 'code', 'action']);

    const user = await this.db.users.findFirstOrThrow({ where: { id: data.user_id } });

    const otp = await this.db.otp.findFirst({
      where: {
        user_id: data.user_id,
        code: data.code.trim(),
        action: data.action.trim(),
        is_used: false,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otp) throw new BadRequestError('Код не найден или уже использован.');
    if (otp.expires_at && otp.expires_at < new Date()) throw new BadRequestError('Срок действия кода истёк.');

    // 🎯 Применение действия в зависимости от типа
    switch (data.action) {
      case 'verify':
        await this.db.users.update({
          where: { id: user.id },
          data: { is_active: true },
        });
        break;

      case 'reset_password':
        validateFields(data, ['new_password']);
        const bcrypt = await import('bcrypt');
        const password_hash = await bcrypt.hash(data.new_password, 12);
        await this.db.users.update({
          where: { id: user.id },
          data: { password_hash },
        });
        break;

      case 'change_phone':
        validateFields(data, ['new_phone']);
        await this.db.users.update({
          where: { id: user.id },
          data: { phone: data.new_phone },
        });
        break;

      case 'change_email':
        validateFields(data, ['new_email']);
        await this.db.users.update({
          where: { id: user.id },
          data: { email: data.new_email.toLowerCase() },
        });
        break;
    }

    await this.db.otp.update({ where: { id: otp.id }, data: { is_used: true } });

    return { success: true, message: `Действие '${data.action}' успешно выполнено.` };
  }

  // ───────────────────────────────────────────────
  // 📲 Отправка через WhatsApp (Green API)
  private async sendOtpViaWhatsApp(phone: string, code: string, action: string) {
    const idInstance = process.env.GREEN_ID_INSTANCE || '7105297627';
    const apiTokenInstance = process.env.GREEN_API_TOKEN || 'a38838326e974083a29230ea6083513bd66e3fbf1462465083';
    const apiUrl = `https://7105.api.green-api.com/waInstance${idInstance}/SendMessage/${apiTokenInstance}`;

    const chatId = phone.replace(/\D/g, '') + '@c.us';

    const actionTextMap: Record<string, string> = {
      verify: `🎉 Добро пожаловать!  
Чтобы завершить регистрацию, введите этот код: *${code}*  
Код действует 10 минут.`,
      reset_password: `🔐 Запрос на сброс пароля.  
Введите код: *${code}*  
После подтверждения вы сможете установить новый пароль.`,
      change_email: `📧 Подтверждение нового email.  
Введите код: *${code}*  
Код действителен 10 минут.`,
      change_phone: `📱 Подтверждение нового номера телефона.  
Введите код: *${code}*  
Код действует 10 минут.`,
    };

    const message =
      actionTextMap[action] ||
      `Ваш код подтверждения: *${code}*  
Срок действия — 10 минут.`;

    try {
      const response = await axios.post(apiUrl, {
        chatId,
        message,
      });
      console.log(`✅ WhatsApp OTP (${action}) sent to ${phone}:`, response.data);
    } catch (err: any) {
      console.error('❌ Ошибка отправки через Green API:', err.response?.data || err.message);
      throw new BadRequestError('Ошибка отправки WhatsApp-сообщения');
    }
  }

  // ───────────────────────────────────────────────
  // 📧 Отправка OTP на Email
  private async sendOtpViaEmail(email: string, code: string, action: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
      },
    });

    const subjectMap: Record<string, string> = {
      verify: 'Подтверждение регистрации',
      reset_password: 'Сброс пароля',
      change_email: 'Подтверждение нового email',
      change_phone: 'Подтверждение нового телефона',
    };

    const bodyMap: Record<string, string> = {
      verify: `
        <p>Добро пожаловать! Чтобы активировать ваш аккаунт, используйте код ниже:</p>
        <h2>${code}</h2>
        <p>Код действителен в течение 10 минут.</p>
      `,
      reset_password: `
        <p>Вы запросили сброс пароля.</p>
        <p>Введите этот код, чтобы подтвердить действие:</p>
        <h2>${code}</h2>
        <p>После подтверждения вы сможете задать новый пароль.</p>
      `,
      change_email: `
        <p>Вы указали новый email для аккаунта.</p>
        <p>Введите код ниже, чтобы подтвердить адрес:</p>
        <h2>${code}</h2>
        <p>Код действителен в течение 10 минут.</p>
      `,
      change_phone: `
        <p>Вы указали новый номер телефона.</p>
        <p>Введите этот код для подтверждения:</p>
        <h2>${code}</h2>
        <p>Код действителен в течение 10 минут.</p>
      `,
    };

    await transporter.sendMail({
      from: `"Support" <${process.env.MAIL_USER!}>`,
      to: email,
      subject: subjectMap[action] || 'Код подтверждения',
      html:
        bodyMap[action] ||
        `
        <p>Ваш код подтверждения:</p>
        <h2>${code}</h2>
        <p>Код действителен 10 минут.</p>
      `,
    });

    console.log(`✅ Email OTP (${action}) sent to ${email}`);
  }

  // ───────────────────────────────────────────────
  // 🔍 Получение списка всех OTP
  async getAll() {
    return this.db.otp.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, firstname: true, lastname: true, username: true } },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const otp = await this.db.otp.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, email: true } },
      } as any,
    });
    if (!otp) throw new BadRequestError('OTP не найден.');
    return otp;
  }

  async getByUserAction(user_id: number, action: string) {
    if (!user_id) throw new BadRequestError('user_id обязателен.');
    if (!action) throw new BadRequestError('action обязателен.');

    return this.db.otp.findMany({
      where: { user_id, action },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        code: true,
        type: true,
        action: true,
        created_at: true,
        expires_at: true,
        is_used: true,
      },
    });
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.otp.delete({ where: { id } });
    return { success: true };
  }
}

export default OTPService;
