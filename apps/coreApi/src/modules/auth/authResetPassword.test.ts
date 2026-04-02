import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupTestEnv } from '../../__tests__/helpers';

setupTestEnv();

function createMockPool(queryResults: any[] = []) {
  const mockQuery = vi.fn();
  for (const result of queryResults) {
    mockQuery.mockResolvedValueOnce(result);
  }
  // Default: return empty rows for unmocked calls
  mockQuery.mockResolvedValue({ rows: [] });

  const mockClient = {
    query: vi.fn().mockResolvedValue({ rows: [] }),
    release: vi.fn(),
  };

  return {
    mockQuery,
    mockClient,
    pool: {
      query: mockQuery,
      connect: vi.fn().mockResolvedValue(mockClient),
    } as any,
  };
}

describe('AuthService — resetPassword', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should reset password for an existing active user', async () => {
    const { pool, mockQuery, mockClient } = createMockPool();

    // 1st call: find user by email + tenantId
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'user-1', is_active: 1 }],
    });

    const { AuthService } = await import('./authService');
    const service = new (AuthService as any)();
    service.pool = pool;

    await service.resetPassword('user@example.com', 'newPassword123', 'tenant-1');

    // Verify user lookup query
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT id'), [
      'user@example.com',
      'tenant-1',
    ]);

    // Verify password update via client transaction
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('set_config'), [
      'tenant-1',
    ]);
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET password_hash'),
      expect.arrayContaining(['user-1'])
    );
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('should throw if user not found', async () => {
    const { pool, mockQuery } = createMockPool();
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const { AuthService } = await import('./authService');
    const service = new (AuthService as any)();
    service.pool = pool;

    await expect(
      service.resetPassword('nobody@example.com', 'newPassword123', 'tenant-1')
    ).rejects.toThrow('User not found.');
  });

  it('should throw if user account is disabled', async () => {
    const { pool, mockQuery } = createMockPool();
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'user-1', is_active: 0 }],
    });

    const { AuthService } = await import('./authService');
    const service = new (AuthService as any)();
    service.pool = pool;

    await expect(
      service.resetPassword('disabled@example.com', 'newPassword123', 'tenant-1')
    ).rejects.toThrow('Account is disabled.');
  });

  it('should throw if database is not available', async () => {
    const { AuthService } = await import('./authService');
    const service = new (AuthService as any)();
    service.pool = null;

    await expect(
      service.resetPassword('user@example.com', 'newPassword123', 'tenant-1')
    ).rejects.toThrow('Database not available.');
  });

  it('should rollback transaction on failure', async () => {
    const { pool, mockQuery, mockClient } = createMockPool();

    // User found
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'user-1', is_active: 1 }],
    });

    // Make UPDATE fail
    mockClient.query.mockImplementation(async (sql: string) => {
      if (sql === 'BEGIN') return;
      if (sql.includes('set_config')) return;
      if (sql.includes('UPDATE')) throw new Error('DB error');
      if (sql === 'COMMIT') return;
    });

    const { AuthService } = await import('./authService');
    const service = new (AuthService as any)();
    service.pool = pool;

    await expect(
      service.resetPassword('user@example.com', 'newPassword123', 'tenant-1')
    ).rejects.toThrow('DB error');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
  });
});
