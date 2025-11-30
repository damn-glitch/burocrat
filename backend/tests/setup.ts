///<reference path="../node_modules/@types/jest/index.d.ts"/>
// Мокаем axios (Green API), чтобы тесты не ходили наружу
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: { idMessage: 'mocked' } }),
  },
}));

// Мокаем nodemailer (email-отправка)
jest.mock('nodemailer', () => {
  const sendMail = jest.fn().mockResolvedValue({ messageId: 'mocked' });
  return {
    __esModule: true,
    default: {
      createTransport: jest.fn().mockReturnValue({ sendMail }),
    },
  };
});
