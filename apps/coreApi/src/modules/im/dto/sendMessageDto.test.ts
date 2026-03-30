import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { SendMessageDto } from './sendMessageDto';

describe('SendMessageDto', () => {
  it('accepts a valid payload with nested metadata', () => {
    const dto = plainToInstance(SendMessageDto, {
      content: 'hello world',
      conversationId: 'conversation-1',
      messageId: 'message-1',
      messageType: 'file',
      metadata: {
        fileName: 'notes.pdf',
        url: 'https://example.com/notes.pdf',
      },
      traceId: 'trace-1',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('rejects invalid messageType and nested metadata length violations', () => {
    const dto = plainToInstance(SendMessageDto, {
      content: 'hello world',
      conversationId: 'conversation-1',
      messageId: 'message-1',
      messageType: 'video',
      metadata: {
        fileName: 'x'.repeat(257),
      },
      traceId: 'trace-1',
    });

    const errors = validateSync(dto);

    expect(findPropertyError(errors, 'messageType')).toBeTruthy();
    const metadataError = findPropertyError(errors, 'metadata');

    expect(metadataError?.children?.[0]?.property).toBe('fileName');
  });
});

function findPropertyError(
  errors: ValidationError[],
  property: string
): ValidationError | undefined {
  return errors.find((error) => error.property === property);
}
