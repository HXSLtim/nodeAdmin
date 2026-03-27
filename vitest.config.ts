import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from apps/coreApi/.env for tests
config({ path: resolve(__dirname, 'apps/coreApi/.env') });

export default defineConfig({
  test: {
    include: ['apps/coreApi/src/**/*.test.ts'],
  },
});
