import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { validatePluginManifest } from '../../../../apps/coreApi/src/modules/plugin/manifestValidator';

const PLUGIN_ROOT = path.resolve(__dirname, '../..');

describe('plugin-example integration', () => {
  it('should have a valid nodeadmin-plugin.json manifest', () => {
    const manifestPath = path.join(PLUGIN_ROOT, 'nodeadmin-plugin.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const manifest = validatePluginManifest(raw);

    expect(manifest.id).toBe('@nodeadmin/plugin-example');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.displayName).toBe('Example Plugin');
    expect(manifest.entrypoints.server).toBe('./dist/server/index.js');
    expect(manifest.entrypoints.ui).toBe('./dist/ui/index.js');
    expect(manifest.contributes?.menus).toHaveLength(1);
    expect(manifest.contributes?.menus?.[0].route).toBe('/plugins/example');
  });

  it('should have a valid package.json', () => {
    const pkgPath = path.join(PLUGIN_ROOT, 'package.json');
    expect(fs.existsSync(pkgPath)).toBe(true);

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).toBe('@nodeadmin/plugin-example');
    expect(pkg.version).toBe('1.0.0');
  });

  it('should have server entry file', () => {
    const serverPath = path.join(PLUGIN_ROOT, 'src/server/index.ts');
    expect(fs.existsSync(serverPath)).toBe(true);
    const content = fs.readFileSync(serverPath, 'utf-8');
    expect(content).toContain('ExampleModule');
  });

  it('should have ui entry file with default export', () => {
    const uiPath = path.join(PLUGIN_ROOT, 'src/ui/index.tsx');
    expect(fs.existsSync(uiPath)).toBe(true);
    const content = fs.readFileSync(uiPath, 'utf-8');
    expect(content).toContain('export default function');
  });
});
