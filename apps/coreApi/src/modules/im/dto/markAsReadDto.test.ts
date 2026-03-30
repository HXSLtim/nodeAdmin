import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { MarkAsReadDto } from './markAsReadDto';

describe('MarkAsReadDto', () => {
  it('accepts a valid mark-as-read payload', () => {
    const dto = plainToInstance(MarkAsReadDto, {
      conversationId: 'conversation-1',
      lastReadMessageId: 'message-9',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('rejects missing or non-string identifiers', () => {
    const missing = plainToInstance(MarkAsReadDto, {});
    const invalid = plainToInstance(MarkAsReadDto, {
      conversationId: 1,
      lastReadMessageId: 2,
    });

    expect(validateSync(missing).length).toBeGreaterThan(0);
    expect(validateSync(invalid).length).toBeGreaterThan(0);
  });
});
