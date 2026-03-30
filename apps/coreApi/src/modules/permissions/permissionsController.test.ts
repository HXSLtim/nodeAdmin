import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsController } from './permissionsController';

function createMockPermissionsService() {
  return {
    findAll: vi.fn(),
    findByModule: vi.fn(),
  };
}

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let permissionsService: ReturnType<typeof createMockPermissionsService>;

  beforeEach(() => {
    permissionsService = createMockPermissionsService();
    controller = new PermissionsController(permissionsService as never);
  });

  it('delegates findAll to permissionsService.findAll', async () => {
    permissionsService.findAll.mockResolvedValue([{ id: 'permission-1' }]);

    const result = await controller.findAll();

    expect(permissionsService.findAll).toHaveBeenCalledWith();
    expect(result).toEqual([{ id: 'permission-1' }]);
  });

  it('delegates findByModule to permissionsService.findByModule', async () => {
    permissionsService.findByModule.mockResolvedValue([{ id: 'permission-2', module: 'im' }]);

    const result = await controller.findByModule('im');

    expect(permissionsService.findByModule).toHaveBeenCalledWith('im');
    expect(result).toEqual([{ id: 'permission-2', module: 'im' }]);
  });

  it('returns empty arrays unchanged from findAll', async () => {
    permissionsService.findAll.mockResolvedValue([]);

    await expect(controller.findAll()).resolves.toEqual([]);
  });

  it('passes through module names with punctuation', async () => {
    permissionsService.findByModule.mockResolvedValue([{ id: 'permission-3', module: 'im:admin' }]);

    const result = await controller.findByModule('im:admin');

    expect(permissionsService.findByModule).toHaveBeenCalledWith('im:admin');
    expect(result[0]?.module).toBe('im:admin');
  });

  it('propagates service errors from findAll', async () => {
    permissionsService.findAll.mockRejectedValue(new Error('permissions unavailable'));

    await expect(controller.findAll()).rejects.toThrow('permissions unavailable');
  });

  it('propagates service errors from findByModule', async () => {
    permissionsService.findByModule.mockRejectedValue(new Error('module lookup failed'));

    await expect(controller.findByModule('users')).rejects.toThrow('module lookup failed');
  });
});
