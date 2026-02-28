import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['Apps/CoreApi/Src/**/*.test.ts'],
  },
});
