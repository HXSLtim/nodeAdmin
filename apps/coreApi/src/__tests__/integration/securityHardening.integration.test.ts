import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createIntegrationContext, type IntegrationContext } from './integrationHarness';

describe.sequential('Security hardening integration', () => {
  let context: IntegrationContext;

  beforeAll(async () => {
    context = await createIntegrationContext({
      HTTP_AUTH_RATE_LIMIT_PER_MINUTE: '2',
      HTTP_RATE_LIMIT_PER_MINUTE: '10',
      SECURITY_CSP:
        "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:",
    });
  });

  afterAll(async () => {
    if (context) {
      await context.close();
    }
  });

  it('returns CSP and baseline security headers on /api/v1/health', async () => {
    const response = await context.http.get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
  });

  it('rate limits repeated auth requests', async () => {
    const credentials = {
      email: 'missing-user@example.com',
      password: 'WrongPassword1!',
      tenantId: 'default',
    };

    const first = await context.http.post('/api/v1/auth/login').send(credentials);
    const second = await context.http.post('/api/v1/auth/login').send(credentials);
    const third = await context.http.post('/api/v1/auth/login').send(credentials);

    expect(first.status).toBe(401);
    expect(second.status).toBe(401);
    expect(third.status).toBe(429);
    expect(third.headers['retry-after']).toBeDefined();
    expect(third.body.message).toBe('Rate limit exceeded. Please retry later.');
  });
});
