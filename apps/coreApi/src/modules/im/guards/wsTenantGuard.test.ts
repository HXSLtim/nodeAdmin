import { ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../auth/authService';
import { WsTenantGuard } from './wsTenantGuard';

function createExecutionContext(
  client: {
    data?: Record<string, unknown>;
    handshake: {
      auth?: Record<string, unknown>;
      headers: Record<string, unknown>;
    };
  },
  data: Record<string, unknown>
): ExecutionContext {
  return {
    switchToWs: () => ({
      getClient: () => client,
      getData: () => data,
    }),
  } as unknown as ExecutionContext;
}

describe('WsTenantGuard', () => {
  it('accepts valid socket token and attaches identity', () => {
    const verifyAccessToken = vi.fn().mockReturnValue({
      jti: 'jti-1',
      roles: ['tenant:admin'],
      tenantId: 'tenant-1',
      userId: 'user-1',
    });

    const authService = {
      verifyAccessToken,
    } as unknown as AuthService;

    const guard = new WsTenantGuard(authService);

    const client = {
      data: {},
      handshake: {
        auth: {
          token: 'token-1',
        },
        headers: {},
      },
    };

    const context = createExecutionContext(client, {
      conversationId: 'conversation-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
    });

    const allowed = guard.canActivate(context);
    expect(allowed).toBe(true);
    expect(verifyAccessToken).toHaveBeenCalledWith('token-1');
    expect((client.data as { identity?: unknown }).identity).toEqual({
      jti: 'jti-1',
      roles: ['tenant:admin'],
      tenantId: 'tenant-1',
      userId: 'user-1',
    });
  });

  it('rejects request when token is missing', () => {
    const authService = {
      verifyAccessToken: vi.fn(),
    } as unknown as AuthService;

    const guard = new WsTenantGuard(authService);
    const client = {
      data: {},
      handshake: {
        auth: {},
        headers: {},
      },
    };

    const context = createExecutionContext(client, {});
    expect(() => guard.canActivate(context)).toThrowError(WsException);
  });

  it('rejects tenant mismatch', () => {
    const authService = {
      verifyAccessToken: vi.fn().mockReturnValue({
        jti: 'jti-1',
        roles: [],
        tenantId: 'tenant-1',
        userId: 'user-1',
      }),
    } as unknown as AuthService;

    const guard = new WsTenantGuard(authService);
    const client = {
      data: {},
      handshake: {
        auth: {
          token: 'token-1',
        },
        headers: {},
      },
    };

    const context = createExecutionContext(client, {
      tenantId: 'tenant-2',
    });

    expect(() => guard.canActivate(context)).toThrowError(WsException);
  });

  it('falls back to the bearer authorization header when handshake auth token is absent', () => {
    const authService = {
      verifyAccessToken: vi.fn().mockReturnValue({
        jti: 'jti-2',
        roles: [],
        tenantId: 'tenant-1',
        userId: 'user-2',
      }),
    } as unknown as AuthService;

    const guard = new WsTenantGuard(authService);
    const client = {
      data: {},
      handshake: {
        auth: {},
        headers: {
          authorization: 'Bearer header-token',
        },
      },
    };

    const context = createExecutionContext(client, {});

    expect(guard.canActivate(context)).toBe(true);
    expect(authService.verifyAccessToken).toHaveBeenCalledWith('header-token');
  });

  it('prefers the socket auth token over the authorization header', () => {
    const authService = {
      verifyAccessToken: vi.fn().mockReturnValue({
        jti: 'jti-3',
        roles: [],
        tenantId: 'tenant-1',
        userId: 'user-3',
      }),
    } as unknown as AuthService;

    const guard = new WsTenantGuard(authService);
    const client = {
      data: {},
      handshake: {
        auth: {
          token: ' socket-token ',
        },
        headers: {
          authorization: 'Bearer header-token',
        },
      },
    };

    const context = createExecutionContext(client, {});

    expect(guard.canActivate(context)).toBe(true);
    expect(authService.verifyAccessToken).toHaveBeenCalledWith('socket-token');
  });

  it('rejects malformed authorization headers when no auth token is provided', () => {
    const guard = new WsTenantGuard({ verifyAccessToken: vi.fn() } as unknown as AuthService);
    const client = {
      data: {},
      handshake: {
        auth: {},
        headers: {
          authorization: 'Basic abc123',
        },
      },
    };

    const context = createExecutionContext(client, {});

    expect(() => guard.canActivate(context)).toThrowError(WsException);
  });

  it('rejects user mismatch between auth token and event payload', () => {
    const authService = {
      verifyAccessToken: vi.fn().mockReturnValue({
        jti: 'jti-4',
        roles: [],
        tenantId: 'tenant-1',
        userId: 'user-1',
      }),
    } as unknown as AuthService;

    const guard = new WsTenantGuard(authService);
    const client = {
      data: {},
      handshake: {
        auth: {
          token: 'token-1',
        },
        headers: {},
      },
    };

    const context = createExecutionContext(client, {
      userId: 'user-2',
    });

    expect(() => guard.canActivate(context)).toThrowError(WsException);
  });

  it('allows events that do not provide tenantId or userId in the payload', () => {
    const authService = {
      verifyAccessToken: vi.fn().mockReturnValue({
        jti: 'jti-5',
        roles: [],
        tenantId: 'tenant-1',
        userId: 'user-1',
      }),
    } as unknown as AuthService;

    const guard = new WsTenantGuard(authService);
    const client = {
      data: { preserved: true },
      handshake: {
        auth: {
          token: 'token-1',
        },
        headers: {},
      },
    };

    const context = createExecutionContext(client, {
      conversationId: 'conversation-1',
    });

    expect(guard.canActivate(context)).toBe(true);
    expect((client.data as Record<string, unknown>).preserved).toBe(true);
  });

  it('propagates access-token verification errors from AuthService', () => {
    const authService = {
      verifyAccessToken: vi.fn().mockImplementation(() => {
        throw new WsException('Invalid access token.');
      }),
    } as unknown as AuthService;

    const guard = new WsTenantGuard(authService);
    const client = {
      data: {},
      handshake: {
        auth: {
          token: 'bad-token',
        },
        headers: {},
      },
    };

    const context = createExecutionContext(client, {});

    expect(() => guard.canActivate(context)).toThrowError(WsException);
  });
});
