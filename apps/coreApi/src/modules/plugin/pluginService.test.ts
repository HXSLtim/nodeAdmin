import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockClient, createMockPool, setupTestEnv } from '../../__tests__/helpers';
import { PluginService } from './pluginService';

setupTestEnv();

describe('PluginService', () => {
  let service: PluginService;

  beforeEach(() => {
    service = new PluginService();
  });

  describe('listTenantPlugins', () => {
    it('returns an empty list when the database pool is unavailable', async () => {
      await expect(service.listTenantPlugins('tenant-1')).resolves.toEqual([]);
    });

    it('rejects when tenantId is missing', async () => {
      await expect(service.listTenantPlugins('')).rejects.toThrow('tenantId is required');
    });

    it('returns plugin rows scoped to the requested tenant', async () => {
      const mockClient = createMockClient([
        { rows: [], rowCount: 0 },
        { rows: [], rowCount: 0 },
        {
          rows: [
            {
              plugin_name: 'im',
              enabled: true,
              config: { uploadLimitMb: 5 },
              enabled_at: new Date('2026-04-06T09:00:00.000Z'),
            },
            {
              plugin_name: 'modernizer',
              enabled: false,
              config: {},
              enabled_at: new Date('2026-04-06T10:00:00.000Z'),
            },
          ],
          rowCount: 2,
        },
        { rows: [], rowCount: 0 },
      ]);
      const mockPool = createMockPool([]);
      mockPool.connect = vi.fn(async () => mockClient);
      (service as unknown as { pool: typeof mockPool }).pool = mockPool;

      await expect(service.listTenantPlugins('tenant-1')).resolves.toEqual([
        {
          config: { uploadLimitMb: 5 },
          enabled: true,
          enabledAt: '2026-04-06T09:00:00.000Z',
          name: 'im',
        },
        {
          config: {},
          enabled: false,
          enabledAt: '2026-04-06T10:00:00.000Z',
          name: 'modernizer',
        },
      ]);

      expect(mockClient.calls[1]).toEqual({
        params: ['tenant-1'],
        sql: "SELECT set_config('app.current_tenant', $1, true)",
      });
      expect(mockClient.calls[2]?.sql).toContain('FROM tenant_plugins');
      expect(mockClient.calls[2]?.sql).toContain('WHERE tenant_id = $1');
      expect(mockClient.calls[2]?.params).toEqual(['tenant-1']);
    });
  });

  describe('isPluginEnabled', () => {
    it('returns false when the database pool is unavailable', async () => {
      await expect(service.isPluginEnabled('tenant-1', 'im')).resolves.toBe(false);
    });

    it('rejects when tenantId is missing', async () => {
      await expect(service.isPluginEnabled('', 'im')).rejects.toThrow('tenantId is required');
    });

    it('returns true when the tenant has the plugin enabled', async () => {
      const mockClient = createMockClient([
        { rows: [], rowCount: 0 },
        { rows: [], rowCount: 0 },
        { rows: [{ enabled: true }], rowCount: 1 },
        { rows: [], rowCount: 0 },
      ]);
      const mockPool = createMockPool([]);
      mockPool.connect = vi.fn(async () => mockClient);
      (service as unknown as { pool: typeof mockPool }).pool = mockPool;

      await expect(service.isPluginEnabled('tenant-1', 'im')).resolves.toBe(true);
      expect(mockClient.calls[2]?.params).toEqual(['tenant-1', 'im']);
    });

    it('returns false when the plugin row is absent or disabled', async () => {
      const mockClient = createMockClient([
        { rows: [], rowCount: 0 },
        { rows: [], rowCount: 0 },
        { rows: [], rowCount: 0 },
        { rows: [], rowCount: 0 },
      ]);
      const mockPool = createMockPool([]);
      mockPool.connect = vi.fn(async () => mockClient);
      (service as unknown as { pool: typeof mockPool }).pool = mockPool;

      await expect(service.isPluginEnabled('tenant-2', 'backlog')).resolves.toBe(false);
      expect(mockClient.calls[2]?.sql).toContain('enabled = true');
      expect(mockClient.calls[2]?.params).toEqual(['tenant-2', 'backlog']);
    });
  });
});
