import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WsException } from '@nestjs/websockets';
import { setupTestEnv } from '../../../__tests__/helpers';

setupTestEnv();

import { runtimeConfig } from '../../../app/runtimeConfig';
import { AuthIdentity } from '../../auth/authIdentity';
import { ImMessageService } from './imMessageService';

function createMockMessageRepository() {
  return {
    append: vi.fn(),
    getLatest: vi.fn(),
    softDelete: vi.fn(),
    updateContent: vi.fn(),
    upsertReadReceipt: vi.fn(),
  };
}

function createIdentity(): AuthIdentity {
  return {
    jti: 'jti-1',
    roles: ['tenant:user'],
    tenantId: 'tenant-1',
    userId: 'user-1',
  };
}

function createContext() {
  return {
    conversationId: 'conversation-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
  };
}

function createPayload(messageId: string) {
  return {
    content: 'hello world',
    conversationId: 'conversation-1',
    messageId,
    traceId: `trace-${messageId}`,
  };
}

function createPersistedMessage(
  sequenceId: number,
  messageId: string
): {
  content: string;
  conversationId: string;
  createdAt: string;
  deletedAt: null;
  editedAt: null;
  messageId: string;
  messageType: 'text';
  metadata: null;
  sequenceId: number;
  tenantId: string;
  traceId: string;
  userId: string;
} {
  return {
    content: 'hello world',
    conversationId: 'conversation-1',
    createdAt: '2026-03-30T12:00:00.000Z',
    deletedAt: null,
    editedAt: null,
    messageId,
    messageType: 'text',
    metadata: null,
    sequenceId,
    tenantId: 'tenant-1',
    traceId: `trace-${messageId}`,
    userId: 'user-1',
  };
}

describe('ImMessageService', () => {
  let service: ImMessageService;
  let messageRepository: ReturnType<typeof createMockMessageRepository>;

  beforeEach(() => {
    messageRepository = createMockMessageRepository();
    messageRepository.getLatest.mockResolvedValue([]);
    messageRepository.append.mockImplementation(async (message) => ({
      duplicate: false,
      message: createPersistedMessage(
        Number(message.messageId.split('-').at(-1) ?? '1'),
        message.messageId
      ),
    }));
    service = new ImMessageService(messageRepository as never);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await flushQueue(service);
  });

  it('returns duplicate metadata immediately for repeated messageId on the same stream', async () => {
    const identity = createIdentity();
    const context = createContext();

    const first = await service.appendMessage(context, createPayload('message-1'), identity);
    const duplicate = await service.appendMessage(context, createPayload('message-1'), identity);

    expect(first.duplicate).toBe(false);
    expect(first.message.sequenceId).toBe(1);
    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.message.messageId).toBe('message-1');
    expect(duplicate.message.sequenceId).toBe(1);
    expect(messageRepository.getLatest).toHaveBeenCalledTimes(1);
    expect(messageRepository.append).not.toHaveBeenCalled();

    await flushQueue(service);

    expect(messageRepository.append).toHaveBeenCalledTimes(1);
  });

  it('enforces websocket message rate limits per tenant and user', async () => {
    const originalLimit = runtimeConfig.rateLimit.wsMessagesPerSecond;
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1000);

    runtimeConfig.rateLimit.wsMessagesPerSecond = 1;

    try {
      const identity = createIdentity();
      const context = createContext();

      await service.appendMessage(context, createPayload('message-1'), identity);

      await expect(
        service.appendMessage(context, createPayload('message-2'), identity)
      ).rejects.toThrow(WsException);

      expect(messageRepository.append).not.toHaveBeenCalled();
    } finally {
      runtimeConfig.rateLimit.wsMessagesPerSecond = originalLimit;
      dateNowSpy.mockRestore();
    }
  });

  it('persists queued messages in a batch when the flush pipeline runs', async () => {
    const identity = createIdentity();
    const context = createContext();

    const results = await Promise.all([
      service.appendMessage(context, createPayload('message-1'), identity),
      service.appendMessage(context, createPayload('message-2'), identity),
      service.appendMessage(context, createPayload('message-3'), identity),
    ]);

    expect(results.map((result) => result.message.sequenceId)).toEqual([1, 2, 3]);
    expect(messageRepository.append).not.toHaveBeenCalled();

    await flushQueue(service);

    expect(messageRepository.append).toHaveBeenCalledTimes(3);
    expect(messageRepository.append.mock.calls.map(([message]) => message.messageId)).toEqual([
      'message-1',
      'message-2',
      'message-3',
    ]);
  });
});

async function flushQueue(service: ImMessageService): Promise<void> {
  await (
    service as unknown as {
      flushQueue: (forceDrain?: boolean) => Promise<void>;
    }
  ).flushQueue(true);
}
