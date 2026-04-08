import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useImSocket } from '../useImSocket';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  const mSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    io: {
      on: vi.fn(),
    }
  };
  return {
    io: vi.fn(() => mSocket),
  };
});

describe('useImSocket', () => {
  const mockOptions = {
    accessToken: 'test-token',
    conversationId: 'conv-1',
    socketUrl: 'http://localhost:11451',
    onConnectionStateChange: vi.fn(),
    onConversationHistory: vi.fn(),
    onMessageReceived: vi.fn(),
    onMessageEdited: vi.fn(),
    onMessageDeleted: vi.fn(),
    onReadReceiptUpdated: vi.fn(),
    onTypingChanged: vi.fn(),
    onPresenceChanged: vi.fn(),
    onPresenceStatusChanged: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should initialize and handle events', () => {
    renderHook(() => useImSocket(mockOptions));
    const mSocket = (io as any).mock.results[0].value;

    const findHandler = (evt: string, emitter: any = mSocket) => 
      emitter.on.mock.calls.find((call: any) => call[0] === evt)[1];

    // Trigger events
    findHandler('messageEdited')({ message: {} });
    expect(mockOptions.onMessageEdited).toHaveBeenCalled();

    findHandler('messageDeleted')({ message: {} });
    expect(mockOptions.onMessageDeleted).toHaveBeenCalled();

    findHandler('readReceiptUpdated')({});
    expect(mockOptions.onReadReceiptUpdated).toHaveBeenCalled();

    findHandler('typingChanged')({});
    expect(mockOptions.onTypingChanged).toHaveBeenCalled();

    findHandler('presenceChanged')({});
    expect(mockOptions.onPresenceChanged).toHaveBeenCalled();

    findHandler('presenceStatusChanged')({});
    expect(mockOptions.onPresenceStatusChanged).toHaveBeenCalled();
  });

  it('should handle emit helpers', async () => {
    const { result } = renderHook(() => useImSocket(mockOptions));
    const mSocket = (io as any).mock.results[0].value;

    result.current.emitDelete({ conversationId: 'c1', messageId: 'm1' });
    expect(mSocket.emit).toHaveBeenCalledWith('deleteMessage', expect.anything());

    result.current.emitEdit({ conversationId: 'c1', messageId: 'm1', content: 'new' });
    expect(mSocket.emit).toHaveBeenCalledWith('editMessage', expect.anything());

    result.current.emitMarkAsRead({ conversationId: 'c1', lastReadMessageId: 'm1' });
    expect(mSocket.emit).toHaveBeenCalledWith('markAsRead', expect.anything());

    result.current.emitSetPresenceStatus('online');
    expect(mSocket.emit).toHaveBeenCalledWith('setPresenceStatus', { status: 'online' });
  });

  it('should handle emitWithAck success and timeout', async () => {
    const { result } = renderHook(() => useImSocket(mockOptions));
    const mSocket = (io as any).mock.results[0].value;

    // Success case
    const promise1 = result.current.emitWithAck({ content: 'hi' } as any, 1000);
    const callback = mSocket.emit.mock.calls.find((c: any) => c[0] === 'sendMessage')[2];
    callback({ accepted: true });
    expect(await promise1).toEqual({ accepted: true });

    // Timeout case
    const promise2 = result.current.emitWithAck({ content: 'hi' } as any, 1000);
    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(await promise2).toBeNull();
  });
});
