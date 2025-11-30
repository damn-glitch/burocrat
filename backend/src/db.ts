import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

// Опционально: корректное выключение
process.on('SIGINT', async () => {
  await db.$disconnect();
  process.exit(0);
});
