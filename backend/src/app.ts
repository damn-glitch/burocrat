// src/app.ts
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import 'source-map-support/register';
import logger from '@src/logger';
import { db } from '@src/db';
import { authMiddleware } from '@src/middlewares/AuthMiddleware';
import { errorMiddleware } from '@src/middlewares/ErrorMiddleware';

// --- Импорты роутов ---
import { authRoutes } from '@routes/authRoutes';
import { otpRoutes } from '@routes/otpRoutes';
import { userRoutes } from '@routes/userRoutes';
import { notificationRoutes } from '@routes/notificationRoutes';
import { companyRoutes } from '@routes/companyRoutes';
import { taskRoutes } from '@routes/taskRoutes';
import { documentRoutes } from '@routes/documentRoutes';
import { settingsRoutes } from '@routes/settingsRoutes';
import { userSettingsRoutes } from '@routes/userSettingsRoutes';
import { employeeCompanyRoutes } from '@routes/employeeCompanyRoutes';
import { positionRoutes } from '@routes/positionRoutes';
import { dictionaryRoutes } from '@routes/dictionaryRoutes';
import { RequestType } from '@src/http/asyncHandler';
import { projectRoutes } from '@routes/projectRoutes';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.dev',
});

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// Логирование запросов
app.use((req: RequestType, res: Response, next: NextFunction) => {
  const started = Date.now();
  (req as any).requestId = randomUUID();

  res.on('finish', () => {
    const duration = Date.now() - started;
    if (process.env.SHOW_ALL_REQUESTS !== 'true' && req.originalUrl.includes('health')) {
      return;
    }
    logger.info(
      `[${req.method}] - ${res.statusCode} - ${req.originalUrl} | [${req.user_id ?? -1}] | duration: ${duration}, ip-from: ${req.ip}, ua: ${req.get('User-Agent')} ` +
        JSON.stringify(
          {
            body: req.body,
            query: req.query,
            requestId: (req as any).requestId,
          },
          null,
          2,
        ),
    );
  });
  next();
});

// Публичные маршруты
app.use('/auth', authRoutes(db));
app.use('/otp', otpRoutes(db));

// Приватные маршруты — после authMiddleware
app.use(authMiddleware);
app.use('/user', userRoutes(db));
app.use('/notification', notificationRoutes(db));
app.use('/company', companyRoutes(db));
app.use('/project', projectRoutes(db));
app.use('/task', taskRoutes(db));
app.use('/document', documentRoutes(db));
app.use('/settings', settingsRoutes(db));
app.use('/user-settings', userSettingsRoutes(db));
app.use('/employee-company', employeeCompanyRoutes(db));
app.use('/position', positionRoutes(db));
app.use('/dictionary', dictionaryRoutes(db));

// Healthcheck
app.get('/', (_req, res) => res.send('Burokrat backend, ok'));
app.get('/health', (_req, res) =>
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    memory: {
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
    },
  }),
);

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Error middleware
app.use(errorMiddleware);

export default app;
