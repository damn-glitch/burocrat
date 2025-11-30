import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Где искать тесты
  testMatch: ['**/tests/**/*.test.ts'],

  // Маппинг alias из tsconfig.json
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
  },

  // Настройки окружения
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  clearMocks: true,
  restoreMocks: true,

  detectOpenHandles: true,
  forceExit: true,
  // Чтобы Jest знал, что мы работаем в TypeScript-проекте
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
};

export default config;
