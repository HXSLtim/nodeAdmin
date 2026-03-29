import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Mock node:fs before importing the service
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
}));

import { AnalyzeService } from './analyzeService';

describe('AnalyzeService', () => {
  let service: AnalyzeService;

  beforeEach(() => {
    vi.restoreAllMocks();
    service = new AnalyzeService();
  });

  // ─── analyze ──────────────────────────────────────────────────────

  describe('analyze', () => {
    it('should return empty result when src directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const result = service.analyze('/fake/root');
      expect(result).toEqual({ issues: [], summary: { total: 0, byCategory: {} } });
    });

    it('should detect console.log calls', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockImplementation((p: string) => {
        return typeof p === 'string' && p.endsWith('src');
      });
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [{ name: 'app.ts', isDirectory: () => false, isFile: () => true }];
        }
        return [];
      });
      vi.mocked(fs.readFileSync).mockReturnValue('console.log("hello");\nconst x = 1;\n');

      const result = service.analyze(projectRoot);
      expect(result.issues).toHaveLength(2); // console-log + unused import check
      expect(result.issues.some((i) => i.category === 'console-log')).toBe(true);
      expect(result.summary.byCategory['console-log']).toBe(1);
    });

    it('should detect TODO/FIXME comments', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [{ name: 'todo.ts', isDirectory: () => false, isFile: () => true }];
        }
        return [];
      });
      vi.mocked(fs.readFileSync).mockReturnValue(
        'import { Injectable } from "@nestjs/common";\n// TODO: fix this later\n'
      );

      const result = service.analyze(projectRoot);
      const todoIssues = result.issues.filter((i) => i.category === 'todo');
      expect(todoIssues).toHaveLength(1);
      expect(todoIssues[0].severity).toBe('info');
    });

    it('should detect FIXME comments', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [{ name: 'fix.ts', isDirectory: () => false, isFile: () => true }];
        }
        return [];
      });
      vi.mocked(fs.readFileSync).mockReturnValue(
        'import { Injectable } from "@nestjs/common";\n// FIXME: broken\n'
      );

      const result = service.analyze(projectRoot);
      const fixmeIssues = result.issues.filter((i) => i.category === 'todo');
      expect(fixmeIssues).toHaveLength(1);
    });

    it('should skip ignored directories', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [
            { name: 'node_modules', isDirectory: () => true, isFile: () => false },
            { name: 'dist', isDirectory: () => true, isFile: () => false },
            { name: 'app.ts', isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });
      vi.mocked(fs.readFileSync).mockReturnValue('const x = 1;\n');

      // Should only read app.ts, not node_modules or dist
      const result = service.analyze(projectRoot);
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    });

    it('should skip test files', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [
            { name: 'app.test.ts', isDirectory: () => false, isFile: () => true },
            { name: 'app.spec.ts', isDirectory: () => false, isFile: () => true },
            { name: 'types.d.ts', isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      const result = service.analyze(projectRoot);
      expect(fs.readFileSync).not.toHaveBeenCalled();
    });

    it('should detect @Body() without validation DTO', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [{ name: 'ctrl.ts', isDirectory: () => false, isFile: () => true }];
        }
        return [];
      });
      vi.mocked(fs.readFileSync).mockReturnValue(
        "import { Body } from '@nestjs/common';\n  @Body() data: any\n"
      );

      const result = service.analyze(projectRoot);
      const validationIssues = result.issues.filter((i) => i.category === 'missing-validation');
      expect(validationIssues).toHaveLength(1);
      expect(validationIssues[0].severity).toBe('warning');
    });

    it('should not flag @Body() with proper DTO', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [{ name: 'ctrl.ts', isDirectory: () => false, isFile: () => true }];
        }
        return [];
      });
      vi.mocked(fs.readFileSync).mockReturnValue(
        "import { Body } from '@nestjs/common';\n  @Body() dto: CreateUserDto\n"
      );

      const result = service.analyze(projectRoot);
      const validationIssues = result.issues.filter((i) => i.category === 'missing-validation');
      expect(validationIssues).toHaveLength(0);
    });

    it('should detect unused imports', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [{ name: 'unused.ts', isDirectory: () => false, isFile: () => true }];
        }
        return [];
      });
      // Only imported but never used
      vi.mocked(fs.readFileSync).mockReturnValue(
        "import { UnusedThing } from './unused';\nconst x = 1;\n"
      );

      const result = service.analyze(projectRoot);
      const unusedIssues = result.issues.filter((i) => i.category === 'unused-import');
      expect(unusedIssues).toHaveLength(1);
      expect(unusedIssues[0].message).toContain('UnusedThing');
    });

    it('should not flag used imports', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [{ name: 'used.ts', isDirectory: () => false, isFile: () => true }];
        }
        return [];
      });
      vi.mocked(fs.readFileSync).mockReturnValue(
        "import { Injectable } from '@nestjs/common';\n@Injectable()\nclass A {}\n"
      );

      const result = service.analyze(projectRoot);
      const unusedIssues = result.issues.filter((i) => i.category === 'unused-import');
      expect(unusedIssues).toHaveLength(0);
    });

    it('should summarize by category correctly', () => {
      const projectRoot = '/fake/project';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: string) => {
        if (typeof dir === 'string' && dir.endsWith('src')) {
          return [{ name: 'messy.ts', isDirectory: () => false, isFile: () => true }];
        }
        return [];
      });
      vi.mocked(fs.readFileSync).mockReturnValue(
        'import { Unused } from "./lib";\nconsole.log("x");\n// TODO: fix\n'
      );

      const result = service.analyze(projectRoot);
      expect(result.summary.total).toBe(result.issues.length);
      expect(result.summary.byCategory).toHaveProperty('console-log');
      expect(result.summary.byCategory).toHaveProperty('todo');
      expect(result.summary.byCategory).toHaveProperty('unused-import');
    });
  });
});
