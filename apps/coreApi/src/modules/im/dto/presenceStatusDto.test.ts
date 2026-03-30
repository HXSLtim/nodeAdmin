import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { PresenceStatusDto } from './presenceStatusDto';

describe('PresenceStatusDto', () => {
  it('accepts supported presence states', () => {
    for (const status of ['online', 'away', 'dnd']) {
      const dto = plainToInstance(PresenceStatusDto, { status });
      expect(validateSync(dto)).toEqual([]);
    }
  });

  it('rejects unsupported or missing presence states', () => {
    const missing = plainToInstance(PresenceStatusDto, {});
    const invalid = plainToInstance(PresenceStatusDto, { status: 'offline' });

    expect(validateSync(missing).length).toBeGreaterThan(0);
    expect(validateSync(invalid).length).toBeGreaterThan(0);
  });
});
