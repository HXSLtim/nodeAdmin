import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
}));

import { DocSyncService } from './docSyncService';

function createDirEntry(name: string) {
  return {
    isDirectory: () => true,
    isFile: () => false,
    name,
  };
}

describe('DocSyncService', () => {
  let service: DocSyncService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DocSyncService();
  });

  it('extracts controller routes and renders them into markdown', () => {
    const srcDir = '/fake/project/apps/coreApi/src';
    const modulesDir = '/fake/project/apps/coreApi/src/modules';
    const usersModuleDir = '/fake/project/apps/coreApi/src/modules/users';

    vi.mocked(fs.existsSync).mockImplementation((target) => {
      if (typeof target !== 'string') {
        return false;
      }

      return [srcDir, modulesDir, usersModuleDir].includes(target);
    });

    vi.mocked(fs.readdirSync).mockImplementation((target) => {
      if (target === modulesDir) {
        return [createDirEntry('users')];
      }

      if (target === usersModuleDir) {
        return ['usersController.ts'];
      }

      return [];
    });

    vi.mocked(fs.readFileSync).mockReturnValue(`
      @Controller('users')
      export class UsersController {
        @ApiOperation({ summary: 'List users' })
        @Get()
        list() {}

        @Post('invite')
        invite() {}
      }
    `);

    const markdown = service.generateDocs('/fake/project');

    expect(markdown).toContain('**Total endpoints: 2**');
    expect(markdown).toContain('| GET | `/api/v1/users` | List users | UsersController |');
    expect(markdown).toContain('| POST | `/api/v1/users/invite` | POST /users/invite | UsersController |');
  });
});
