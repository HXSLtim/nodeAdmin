import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from Apps/CoreApi/.env for tests
config({ path: resolve(__dirname, 'Apps/CoreApi/.env') });

export default defineConfig({
  test: {
    include: ['Apps/CoreApi/Src/**/*.test.ts'],
  },
});
