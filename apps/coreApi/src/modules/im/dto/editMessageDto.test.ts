import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { EditMessageDto } from './editMessageDto';

describe('EditMessageDto', () => {
  it('accepts a valid edit payload', () => {
    const dto = plainToInstance(EditMessageDto, {
      content: 'updated message',
      conversationId: 'conversation-1',
      messageId: 'message-1',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('rejects blank or overlong edit payload fields', () => {
    const blank = plainToInstance(EditMessageDto, {
      content: '',
      conversationId: '',
      messageId: '',
    });
    const overlong = plainToInstance(EditMessageDto, {
      content: 'x'.repeat(2001),
      conversationId: 'c'.repeat(129),
      messageId: 'm'.repeat(129),
    });

    expect(validateSync(blank).length).toBeGreaterThan(0);
    expect(validateSync(overlong).length).toBeGreaterThan(0);
  });
});
