import { describe, expect, it } from 'vitest';

import { HttpRateLimiter } from './httpRateLimiter';

describe('HttpRateLimiter', () => {
  it('allows requests within the configured window and reports remaining budget', () => {
    const limiter = new HttpRateLimiter();

    const first = limiter.check('127.0.0.1::http', 2, 60_000, 1_000);
    const second = limiter.check('127.0.0.1::http', 2, 60_000, 1_500);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it('rejects requests after the limit is exhausted', () => {
    const limiter = new HttpRateLimiter();

    limiter.check('127.0.0.1::auth', 1, 60_000, 2_000);
    const rejected = limiter.check('127.0.0.1::auth', 1, 60_000, 2_500);

    expect(rejected.allowed).toBe(false);
    expect(rejected.remaining).toBe(0);
    expect(rejected.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets the window after the configured interval', () => {
    const limiter = new HttpRateLimiter();

    limiter.check('127.0.0.1::http', 1, 1_000, 3_000);
    const reset = limiter.check('127.0.0.1::http', 1, 1_000, 4_100);

    expect(reset.allowed).toBe(true);
    expect(reset.remaining).toBe(0);
  });
});
