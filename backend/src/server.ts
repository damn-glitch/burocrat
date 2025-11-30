// src/server.ts
import app from './app';
import { db } from '@src/db';
import logger from '@src/logger';

const PORT = process.env.APP_PORT || 8011;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.warn(`${signal} received, shutting down...`);
  server.close(async () => {
    try {
      await db.$disconnect?.();
      logger.info('Database disconnected gracefully');
    } catch (err: any) {
      logger.error(`Error during DB disconnect: ${err.message}`);
    } finally {
      process.exit(0);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (r) => logger.error(`unhandledRejection: ${r}`));
process.on('uncaughtException', (e) => {
  logger.error(`uncaughtException: ${e}`);
  process.exit(1);
});
