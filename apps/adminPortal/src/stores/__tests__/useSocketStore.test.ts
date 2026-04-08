import { describe, it, expect, beforeEach } from 'vitest';
import { useSocketStore } from '../useSocketStore';

describe('useSocketStore', () => {
  beforeEach(() => {
    useSocketStore.setState({ connectionState: 'disconnected' });
  });

  it('should set connection state', () => {
    expect(useSocketStore.getState().connectionState).toBe('disconnected');
    useSocketStore.getState().setConnectionState('connected');
    expect(useSocketStore.getState().connectionState).toBe('connected');
    useSocketStore.getState().setConnectionState('reconnecting');
    expect(useSocketStore.getState().connectionState).toBe('reconnecting');
  });
});
