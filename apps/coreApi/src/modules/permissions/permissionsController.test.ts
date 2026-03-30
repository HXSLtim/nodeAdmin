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
});
