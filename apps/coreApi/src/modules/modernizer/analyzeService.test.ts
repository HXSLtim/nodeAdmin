import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
}));

import { AnalyzeService } from './analyzeService';

const projectRoot = path.join(path.sep, 'fake', 'project');
const srcDir = path.join(projectRoot, 'apps', 'coreApi', 'src');

function createFileEntry(name: string) {
  return {
    isDirectory: () => false,
    isFile: () => true,
    name,
  };
}

function mockSourceFiles(files: Record<string, string>): void {
  vi.mocked(fs.existsSync).mockImplementation((target) => {
    if (typeof target !== 'string') {
      return false;
    }

    return target === srcDir || target in files;
  });

  vi.mocked(fs.readdirSync).mockImplementation((target) => {
    if (target !== srcDir) {
      return [];
    }

    return Object.keys(files).map((filePath) => createFileEntry(path.basename(filePath)));
  });

  vi.mocked(fs.readFileSync).mockImplementation((target) => {
    if (typeof target !== 'string') {
      return '';
    }

    return files[target] ?? '';
  });
}

describe('AnalyzeService', () => {
  let service: AnalyzeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnalyzeService();
  });

  it('returns an empty result when the src directory does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(service.analyze(projectRoot)).toEqual({
      issues: [],
      summary: {
        byCategory: {},
        total: 0,
      },
    });
  });

  it('detects the console-log analysis category', () => {
    mockSourceFiles({
      [path.join(srcDir, 'app.ts')]: 'console.log("hello");\n',
    });

    const result = service.analyze(projectRoot);

    expect(result.issues).toEqual([
      expect.objectContaining({
        category: 'console-log',
        file: 'src/app.ts',
        line: 1,
        severity: 'error',
      }),
    ]);
    expect(result.summary.byCategory['console-log']).toBe(1);
  });

  it('detects the todo analysis category for TODO and FIXME comments', () => {
    mockSourceFiles({
      [path.join(srcDir, 'todo.ts')]: '// TODO: revisit\n// FIXME: broken\n',
    });

    const result = service.analyze(projectRoot);

    expect(result.issues.map((issue) => issue.category)).toEqual(['todo', 'todo']);
    expect(result.summary.byCategory.todo).toBe(2);
  });

  it('detects the missing-validation analysis category', () => {
    mockSourceFiles({
      [path.join(srcDir, 'controller.ts')]: '@Body() payload: RawPayload\n',
    });

    const result = service.analyze(projectRoot);

    expect(result.issues).toEqual([
      expect.objectContaining({
        category: 'missing-validation',
        file: 'src/controller.ts',
        line: 1,
        severity: 'warning',
      }),
    ]);
  });

  it('detects the unused-import analysis category', () => {
    mockSourceFiles({
      [path.join(srcDir, 'unused.ts')]: "import { UnusedThing } from './dep';\nconst value = 1;\n",
    });

    const result = service.analyze(projectRoot);

    expect(result.issues).toEqual([
      expect.objectContaining({
        category: 'unused-import',
        file: 'src/unused.ts',
        line: 1,
      }),
    ]);
  });
});
