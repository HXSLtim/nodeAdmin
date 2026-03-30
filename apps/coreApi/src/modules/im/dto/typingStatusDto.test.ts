import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { TypingStatusDto } from './typingStatusDto';

describe('TypingStatusDto', () => {
  it('accepts valid typing payloads', () => {
    const dto = plainToInstance(TypingStatusDto, {
      conversationId: 'conversation-1',
      isTyping: true,
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('rejects missing or invalid typing payloads', () => {
    const missing = plainToInstance(TypingStatusDto, {});
    const invalid = plainToInstance(TypingStatusDto, {
      conversationId: '',
      isTyping: 'yes',
    });

    expect(validateSync(missing).length).toBeGreaterThan(0);
    expect(validateSync(invalid).length).toBeGreaterThan(0);
  });
});
