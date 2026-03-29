/**
 * Modernizer CLI — code analysis and doc sync.
 *
 * Usage:
 *   npm run modernizer:analyze        — Run code analysis, output JSON to stdout
 *   npm run modernizer:sync-docs      — Generate/update docs/api-endpoints.md
 */
import * as path from 'node:path';
import * as fs from 'node:fs';

// Inline the services to avoid NestJS DI overhead for CLI usage

type AnalysisCategory = 'console-log' | 'todo' | 'missing-validation' | 'unused-import';
type AnalysisSeverity = 'info' | 'warning' | 'error';

interface AnalysisIssue {
  file: string;
  line: number;
  category: AnalysisCategory;
  message: string;
  severity: AnalysisSeverity;
}

interface AnalysisResult {
  issues: AnalysisIssue[];
  summary: { total: number; byCategory: Record<string, number> };
}

const CONSOLE_REGEX = /\bconsole\.(log|warn|error)\s*\(/;
const TODO_REGEX = /\/\/\s*(TODO|FIXME)\b/i;
const BODY_NO_VALIDATION_REGEX =
  /@Body\(\)\s+(\w+):\s+(?!Create|Update|List|Login|Register|Change)(\w+)/;
const IMPORT_REGEX = /^import\s+(?:\{([^}]+)\}|(\w+))\s+from/;

const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage', '__tests__']);
const IGNORED_SUFFIXES = new Set(['.test.ts', '.spec.ts', '.d.ts']);

function resolveProjectRoot(): string {
  // __dirname = .../apps/coreApi/tools/modernizer
  return path.resolve(__dirname, '..', '..');
}

function analyze(projectRoot: string): AnalysisResult {
  const srcDir = path.join(projectRoot, 'src');
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory not found: ${srcDir}`);
    return { issues: [], summary: { total: 0, byCategory: {} } };
  }

  const issues: AnalysisIssue[] = [];
  scanDirectory(srcDir, issues, projectRoot);

  const byCategory: Record<string, number> = {};
  for (const issue of issues) {
    byCategory[issue.category] = (byCategory[issue.category] ?? 0) + 1;
  }

  return { issues, summary: { total: issues.length, byCategory } };
}

function scanDirectory(dir: string, issues: AnalysisIssue[], root: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, issues, root);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      if (IGNORED_SUFFIXES.has(entry.name) || entry.name.endsWith('.test.ts')) continue;
      scanFile(fullPath, issues, root);
    }
  }
}

function scanFile(filePath: string, issues: AnalysisIssue[], root: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(root, filePath).replace(/\\/g, '/');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (CONSOLE_REGEX.test(line)) {
      const methodMatch = line.match(/\bconsole\.(log|warn|error)/);
      const method = methodMatch ? methodMatch[1] : 'log';
      issues.push({
        file: relativePath,
        line: lineNum,
        category: 'console-log',
        message: `Found console.${method} call — use NestJS Logger instead`,
        severity: 'error',
      });
    }

    const todoMatch = TODO_REGEX.exec(line);
    if (todoMatch) {
      issues.push({
        file: relativePath,
        line: lineNum,
        category: 'todo',
        message: `${todoMatch[1].toUpperCase()} comment found`,
        severity: 'info',
      });
    }

    if (BODY_NO_VALIDATION_REGEX.test(line)) {
      issues.push({
        file: relativePath,
        line: lineNum,
        category: 'missing-validation',
        message: '@Body() parameter may be missing class-validator DTO',
        severity: 'warning',
      });
    }
  }

  checkUnusedImports(lines, relativePath, issues);
}

function checkUnusedImports(lines: string[], filePath: string, issues: AnalysisIssue[]): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const importMatch = IMPORT_REGEX.exec(line);
    if (!importMatch) continue;

    const namedImports = importMatch[1];
    const defaultImport = importMatch[2];

    if (namedImports) {
      const names = namedImports
        .split(',')
        .map((n: string) =>
          n
            .trim()
            .split(/\s+as\s+/)
            .pop()!
            .trim()
        )
        .filter(Boolean);

      const fullContent = lines.join('\n');
      for (const name of names) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'g');
        const matches = fullContent.match(regex);
        const count = matches ? matches.length : 0;

        if (count <= 1) {
          issues.push({
            file: filePath,
            line: i + 1,
            category: 'unused-import',
            message: `Import "${name}" appears to be unused`,
            severity: 'info',
          });
        }
      }
    } else if (defaultImport) {
      const fullContent = lines.join('\n');
      const escaped = defaultImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'g');
      const matches = fullContent.match(regex);
      const count = matches ? matches.length : 0;

      if (count <= 1) {
        issues.push({
          file: filePath,
          line: i + 1,
          category: 'unused-import',
          message: `Default import "${defaultImport}" appears to be unused`,
          severity: 'info',
        });
      }
    }
  }
}

// ─── Doc Sync ──────────────────────────────────────────────────────────

interface EndpointInfo {
  method: string;
  path: string;
  summary: string;
  controller: string;
}

const HTTP_DECORATORS: [RegExp, string][] = [
  [/@Get\s*\(\s*'([^']*)'\s*\)/, 'GET'],
  [/@Post\s*\(\s*'([^']*)'\s*\)/, 'POST'],
  [/@Put\s*\(\s*'([^']*)'\s*\)/, 'PUT'],
  [/@Patch\s*\(\s*'([^']*)'\s*\)/, 'PATCH'],
  [/@Delete\s*\(\s*'([^']*)'\s*\)/, 'DELETE'],
];

function generateDocs(projectRoot: string): string {
  const modulesDir = path.join(projectRoot, 'src', 'modules');

  if (!fs.existsSync(modulesDir)) {
    console.error(`Modules directory not found: ${modulesDir}`);
    return '# API Endpoints\n\nNo modules directory found.\n';
  }

  const endpoints = extractAllEndpoints(modulesDir);
  return renderMarkdown(endpoints);
}

function extractAllEndpoints(modulesDir: string): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];
  const entries = fs.readdirSync(modulesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const controllerFiles = fs
      .readdirSync(path.join(modulesDir, entry.name))
      .filter((f: string) => f.endsWith('Controller.ts'));

    for (const cf of controllerFiles) {
      const filePath = path.join(modulesDir, entry.name, cf);
      const controllerEndpoints = parseController(filePath);
      endpoints.push(...controllerEndpoints);
    }
  }

  return endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
}

function parseController(filePath: string): EndpointInfo[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const controllerMatch = content.match(/@Controller\s*\(\s*'([^']*)'\s*\)/);
  const prefix = controllerMatch ? `/${controllerMatch[1]}` : '';

  const classMatch = content.match(/export\s+class\s+(\w+Controller)/);
  const controllerName = classMatch ? classMatch[1] : 'Unknown';

  const endpoints: EndpointInfo[] = [];
  let currentSummary = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const apiOpMatch = line.match(/@ApiOperation\s*\(\s*\{\s*summary:\s*'([^']*)'/);
    if (apiOpMatch) {
      currentSummary = apiOpMatch[1];
      continue;
    }

    for (const [regex, method] of HTTP_DECORATORS) {
      const match = regex.exec(line);
      if (match) {
        const routePath = match[1];
        const fullPath = `${prefix}${routePath ? `/${routePath}` : ''}`;

        endpoints.push({
          method,
          path: `/api/v1${fullPath}`,
          summary: currentSummary || `${method} ${fullPath}`,
          controller: controllerName,
        });

        currentSummary = '';
        break;
      }
    }

    if (
      !line.startsWith('@') &&
      !line.startsWith('//') &&
      !line.startsWith('*') &&
      line.length > 0
    ) {
      currentSummary = '';
    }
  }

  return endpoints;
}

function renderMarkdown(endpoints: EndpointInfo[]): string {
  const lines: string[] = [
    '# API Endpoints',
    '',
    `> Auto-generated by modernizer:sync-docs — ${new Date().toISOString().split('T')[0]}`,
    '',
    `**Total endpoints: ${endpoints.length}**`,
    '',
    '| Method | Path | Summary | Controller |',
    '|--------|------|---------|------------|',
  ];

  for (const ep of endpoints) {
    lines.push(`| ${ep.method} | \`${ep.path}\` | ${ep.summary} | ${ep.controller} |`);
  }

  return lines.join('\n') + '\n';
}

// ─── CLI Entry Point ────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    console.log(`
Usage:
  npm run modernizer:analyze       Run code analysis, output JSON to stdout
  npm run modernizer:sync-docs     Generate docs/api-endpoints.md
`);
    process.exit(0);
  }

  const root = resolveProjectRoot();

  if (command === 'analyze') {
    const result = analyze(root);
    console.log(JSON.stringify(result, null, 2));

    if (result.summary.total > 0) {
      console.error(`\nFound ${result.summary.total} issue(s):`);
      for (const [cat, count] of Object.entries(result.summary.byCategory)) {
        console.error(`  ${cat}: ${count}`);
      }
    } else {
      console.error('\nNo issues found!');
    }
  } else if (command === 'sync-docs') {
    const markdown = generateDocs(root);
    const docsDir = path.join(root, '..', '..', 'docs');
    const outputPath = path.join(docsDir, 'api-endpoints.md');

    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`Documentation generated at: ${outputPath}`);
  } else {
    console.error(`Unknown command: ${command}. Use 'analyze' or 'sync-docs'.`);
    process.exit(1);
  }
}

main();
