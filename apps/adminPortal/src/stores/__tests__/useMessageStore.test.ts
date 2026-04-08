import { describe, it, expect, beforeEach } from 'vitest';
import { useMessageStore } from '../useMessageStore';

describe('useMessageStore', () => {
  beforeEach(() => {
    useMessageStore.setState({ messages: [] });
  });

  const mockMsg1 = {
    messageId: 'msg-1',
    conversationId: 'conv-1',
    userId: 'user-1',
    content: 'hello',
    sequenceId: 1,
    createdAt: new Date().toISOString(),
  } as any;

  const mockMsg2 = {
    messageId: 'msg-2',
    conversationId: 'conv-1',
    userId: 'user-2',
    content: 'world',
    sequenceId: 2,
    createdAt: new Date().toISOString(),
  } as any;

  it('should reset messages and sort them by sequenceId', () => {
    useMessageStore.getState().resetMessages([mockMsg2, mockMsg1]);

    const messages = useMessageStore.getState().messages;
    expect(messages).toHaveLength(2);
    expect(messages[0].messageId).toBe('msg-1');
    expect(messages[1].messageId).toBe('msg-2');
  });

  it('should upsert a new message and maintain sort order', () => {
    useMessageStore.getState().resetMessages([mockMsg1]);
    useMessageStore.getState().upsertMessage(mockMsg2);

    const messages = useMessageStore.getState().messages;
    expect(messages).toHaveLength(2);
    expect(messages[1].messageId).toBe('msg-2');
  });

  it('should update an existing message if messageId matches', () => {
    useMessageStore.getState().resetMessages([mockMsg1]);

    const updatedMsg1 = { ...mockMsg1, content: 'updated' };
    useMessageStore.getState().upsertMessage(updatedMsg1);

    const messages = useMessageStore.getState().messages;
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe('updated');
  });

  it('should normalize messages (fill defaults)', () => {
    const rawMsg = {
      messageId: 'msg-3',
      sequenceId: 3,
    } as any;

    useMessageStore.getState().upsertMessage(rawMsg);

    const message = useMessageStore.getState().messages[0];
    expect(message.messageType).toBe('text');
    expect(message.metadata).toBeNull();
  });
});
