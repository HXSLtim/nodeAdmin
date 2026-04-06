import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTestEnv, setupTestEnv } from '../__tests__/helpers';

const ORIGINAL_SINGLE_TENANT_MODE = process.env.SINGLE_TENANT_MODE;
const ORIGINAL_DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

describe('runtimeConfig', () => {
  beforeEach(() => {
    setupTestEnv();
    delete process.env.SINGLE_TENANT_MODE;
    delete process.env.DEFAULT_TENANT_ID;
    vi.resetModules();
  });

  afterEach(() => {
    if (ORIGINAL_SINGLE_TENANT_MODE === undefined) {
      delete process.env.SINGLE_TENANT_MODE;
    } else {
      process.env.SINGLE_TENANT_MODE = ORIGINAL_SINGLE_TENANT_MODE;
    }

    if (ORIGINAL_DEFAULT_TENANT_ID === undefined) {
      delete process.env.DEFAULT_TENANT_ID;
    } else {
      process.env.DEFAULT_TENANT_ID = ORIGINAL_DEFAULT_TENANT_ID;
    }

    clearTestEnv();
    vi.resetModules();
  });

  it('reads default tenant configuration when env vars are unset', async () => {
    const { runtimeConfig } = await import('./runtimeConfig');

    expect(runtimeConfig.tenant.singleTenantMode).toBe(false);
    expect(runtimeConfig.tenant.defaultTenantId).toBe('default');
  });

  it('reads tenant configuration overrides from env vars', async () => {
    process.env.SINGLE_TENANT_MODE = 'true';
    process.env.DEFAULT_TENANT_ID = 'tenant-system';
    vi.resetModules();

    const { runtimeConfig } = await import('./runtimeConfig');

    expect(runtimeConfig.tenant.singleTenantMode).toBe(true);
    expect(runtimeConfig.tenant.defaultTenantId).toBe('tenant-system');
  });
});
