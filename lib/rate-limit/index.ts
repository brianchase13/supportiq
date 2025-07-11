import { RateLimiterMemory } from 'rate-limiter-flexible';

// Different rate limiters for different operations
export const authLimiter = new RateLimiterMemory({
  keyPrefix: 'auth_fail',
  points: 5, // Number of attempts
  duration: 900, // Per 15 minutes
});

export const apiLimiter = new RateLimiterMemory({
  keyPrefix: 'api_call',
  points: 100, // Number of requests
  duration: 60, // Per minute
});

export const syncLimiter = new RateLimiterMemory({
  keyPrefix: 'sync_operation',
  points: 3, // Number of sync operations
  duration: 300, // Per 5 minutes
});

export const dashboardLimiter = new RateLimiterMemory({
  keyPrefix: 'dashboard_request',
  points: 30, // Number of dashboard requests
  duration: 60, // Per minute
});

export async function checkRateLimit(
  limiter: RateLimiterMemory,
  key: string
): Promise<{ allowed: boolean; msBeforeNext?: number }> {
  try {
    await limiter.consume(key);
    return { allowed: true };
  } catch (rejRes: any) {
    return {
      allowed: false,
      msBeforeNext: rejRes.msBeforeNext,
    };
  }
}