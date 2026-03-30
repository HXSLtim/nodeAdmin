import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    globalSetup: ['apps/coreApi/src/__tests__/globalSetup.ts'],
    hookTimeout: 120000,
    include: ['apps/coreApi/src/__tests__/integration/**/*.integration.test.ts'],
    testTimeout: 120000,
  },
});
