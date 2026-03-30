import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthController } from './healthController';

function createMockHealthService() {
  return {
    getHealth: vi.fn(),
  };
}

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: ReturnType<typeof createMockHealthService>;

  beforeEach(() => {
    healthService = createMockHealthService();
    controller = new HealthController(healthService as never);
  });

  it('delegates health responses to HealthService', async () => {
    healthService.getHealth.mockResolvedValue({
      checks: {
        database: { message: 'Database reachable.', status: 'ok' },
        kafka: { message: 'Kafka reachable.', status: 'ok' },
        redis: { message: 'Redis reachable.', status: 'ok' },
      },
      service: 'coreApi',
      status: 'ok',
      timestamp: '2026-03-30T10:00:00.000Z',
      version: '0.1.0',
    });

    const result = await controller.getHealth();

    expect(healthService.getHealth).toHaveBeenCalledWith();
    expect(result.status).toBe('ok');
  });
});
