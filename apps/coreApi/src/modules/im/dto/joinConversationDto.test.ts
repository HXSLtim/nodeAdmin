import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { JoinConversationDto } from './joinConversationDto';

describe('JoinConversationDto', () => {
  it('accepts a non-empty conversationId within the length limit', () => {
    const dto = plainToInstance(JoinConversationDto, {
      conversationId: 'conversation-1',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('rejects blank or overlong conversationId values', () => {
    const blankDto = plainToInstance(JoinConversationDto, {
      conversationId: '',
    });
    const overlongDto = plainToInstance(JoinConversationDto, {
      conversationId: 'c'.repeat(129),
    });

    expect(validateSync(blankDto).length).toBeGreaterThan(0);
    expect(validateSync(overlongDto).length).toBeGreaterThan(0);
  });
});
