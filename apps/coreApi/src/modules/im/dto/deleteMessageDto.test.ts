import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { DeleteMessageDto } from './deleteMessageDto';

describe('DeleteMessageDto', () => {
  it('accepts a valid delete payload', () => {
    const dto = plainToInstance(DeleteMessageDto, {
      conversationId: 'conversation-1',
      messageId: 'message-1',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('rejects missing, blank, or overlong identifiers', () => {
    const missing = plainToInstance(DeleteMessageDto, {});
    const blank = plainToInstance(DeleteMessageDto, {
      conversationId: '',
      messageId: '',
    });
    const overlong = plainToInstance(DeleteMessageDto, {
      conversationId: 'c'.repeat(129),
      messageId: 'm'.repeat(129),
    });

    expect(validateSync(missing).length).toBeGreaterThan(0);
    expect(validateSync(blank).length).toBeGreaterThan(0);
    expect(validateSync(overlong).length).toBeGreaterThan(0);
  });
});
