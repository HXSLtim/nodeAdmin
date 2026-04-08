import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, setAuthFromLogin, clearAuthStore } from '../useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store state
    localStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
      refreshToken: null,
      tenantId: null,
      userId: null,
      userName: null,
      userRoles: [],
    });
    vi.clearAllMocks();
  });

  it('should set access token and persist to localStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    useAuthStore.getState().setAccessToken('test-token');
    
    expect(useAuthStore.getState().accessToken).toBe('test-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(spy).toHaveBeenCalledWith('nodeadmin_auth', expect.stringContaining('test-token'));
  });

  it('should set tenant ID and persist', () => {
    useAuthStore.getState().setTenantId('tenant-1');
    expect(useAuthStore.getState().tenantId).toBe('tenant-1');
    expect(JSON.parse(localStorage.getItem('nodeadmin_auth')!)).toMatchObject({
      tenantId: 'tenant-1'
    });
  });

  it('should handle setAuthFromLogin and persist all fields', () => {
    const mockData = {
      accessToken: 'access',
      refreshToken: 'refresh',
      identity: {
        userId: 'user-1',
        tenantId: 'tenant-1',
        roles: ['admin']
      },
      name: 'Test User'
    };

    setAuthFromLogin(mockData);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access');
    expect(state.isAuthenticated).toBe(true);
    expect(state.userId).toBe('user-1');
    expect(state.userName).toBe('Test User');
    expect(state.userRoles).toContain('admin');

    const stored = JSON.parse(localStorage.getItem('nodeadmin_auth')!);
    expect(stored.accessToken).toBe('access');
    expect(stored.userName).toBe('Test User');
  });

  it('should clear store and localStorage on logout', () => {
    useAuthStore.setState({ accessToken: 'token', isAuthenticated: true });
    localStorage.setItem('nodeadmin_auth', JSON.stringify({ accessToken: 'token' }));

    clearAuthStore();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('nodeadmin_auth')).toBeNull();
  });
});
