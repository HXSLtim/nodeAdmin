import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockClient, createMockPool, setupTestEnv } from '../../__tests__/helpers';
import { PluginAutoUpdateService } from './pluginAutoUpdateService';
import { PluginMarketService } from './pluginMarketService';

setupTestEnv();

describe('PluginAutoUpdateService', () => {
  let service: PluginAutoUpdateService;
  let marketService: PluginMarketService;

  beforeEach(() => {
    marketService = new PluginMarketService();
    service = new PluginAutoUpdateService(marketService);
  });

  it('schedules recurring update checks on module init when a pool is available', async () => {
    const setIntervalSpy = vi
      .spyOn(global, 'setInterval')
      .mockReturnValue({} as NodeJS.Timeout);
    const runSpy = vi
      .spyOn(service, 'runAutoUpdateCycle')
      .mockResolvedValue(undefined);

    (service as unknown as { pool: { end: ReturnType<typeof vi.fn> } }).pool = {
      end: vi.fn(),
    };

    await service.onModuleInit();

    expect(runSpy).toHaveBeenCalledWith();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it('updates tenant plugins to the newest compatible version when auto_update is enabled', async () => {
    const client = createMockClient([
      { rows: [], rowCount: 0 },
      {
        rows: [
          {
            installed_version: '1.1.0',
            plugin_name: '@nodeadmin/plugin-kanban',
            tenant_id: 'tenant-1',
          },
        ],
        rowCount: 1,
      },
      {
        rows: [
          { min_platform_version: '>=2.0.0', version: '2.0.0' },
          { min_platform_version: '>=0.1.0', version: '1.3.0' },
        ],
        rowCount: 2,
      },
      { rows: [], rowCount: 1 },
      { rows: [], rowCount: 0 },
    ]);
    const mockPool = createMockPool([]);
    mockPool.connect = vi.fn(async () => client);
    (service as unknown as { pool: typeof mockPool }).pool = mockPool;

    await service.runAutoUpdateCycle();

    expect(client.calls[1]?.sql).toContain('FROM tenant_plugins');
    expect(client.calls[2]?.sql).toContain('FROM plugin_versions');
    expect(client.calls[3]?.sql).toContain('UPDATE tenant_plugins');
    expect(client.calls[3]?.params).toEqual(['1.3.0', 'tenant-1', '@nodeadmin/plugin-kanban']);
  });

  it('skips updates when no newer compatible version exists', async () => {
    const client = createMockClient([
      { rows: [], rowCount: 0 },
      {
        rows: [
          {
            installed_version: '1.3.0',
            plugin_name: '@nodeadmin/plugin-kanban',
            tenant_id: 'tenant-1',
          },
        ],
        rowCount: 1,
      },
      {
        rows: [{ min_platform_version: '>=2.0.0', version: '2.0.0' }],
        rowCount: 1,
      },
      { rows: [], rowCount: 0 },
    ]);
    const mockPool = createMockPool([]);
    mockPool.connect = vi.fn(async () => client);
    (service as unknown as { pool: typeof mockPool }).pool = mockPool;

    await service.runAutoUpdateCycle();

    expect(client.calls.some((call) => call.sql.includes('UPDATE tenant_plugins'))).toBe(false);
    expect(client.calls.some((call) => call.sql === 'COMMIT')).toBe(true);
  });
});
