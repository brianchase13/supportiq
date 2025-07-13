import { supabaseAdmin } from '@/lib/supabase/client';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(userId: string, action: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${userId}:${action}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current rate limit data
      const { data: existing } = await supabaseAdmin
        .from('rate_limits')
        .select('*')
        .eq('key', key)
        .single();

      if (!existing) {
        // First request in this window
        await supabaseAdmin
          .from('rate_limits')
          .insert({
            key,
            user_id: userId,
            action,
            requests: 1,
            window_start: new Date(windowStart).toISOString(),
            created_at: new Date().toISOString()
          });

        return {
          success: true,
          remaining: this.config.maxRequests - 1,
          resetTime: now + this.config.windowMs
        };
      }

      // Check if we're in a new window
      const existingWindowStart = new Date(existing.window_start).getTime();
      if (now - existingWindowStart >= this.config.windowMs) {
        // New window, reset counter
        await supabaseAdmin
          .from('rate_limits')
          .update({
            requests: 1,
            window_start: new Date(windowStart).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('key', key);

        return {
          success: true,
          remaining: this.config.maxRequests - 1,
          resetTime: now + this.config.windowMs
        };
      }

      // Check if limit exceeded
      if (existing.requests >= this.config.maxRequests) {
        const retryAfter = existingWindowStart + this.config.windowMs - now;
        return {
          success: false,
          remaining: 0,
          resetTime: existingWindowStart + this.config.windowMs,
          retryAfter: Math.ceil(retryAfter / 1000)
        };
      }

      // Increment request count
      await supabaseAdmin
        .from('rate_limits')
        .update({
          requests: existing.requests + 1,
          updated_at: new Date().toISOString()
        })
        .eq('key', key);

      return {
        success: true,
        remaining: this.config.maxRequests - existing.requests - 1,
        resetTime: existingWindowStart + this.config.windowMs
      };

    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if rate limiting fails
      return {
        success: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
  }

  async getRemaining(userId: string, action: string): Promise<number> {
    const key = `${this.config.keyPrefix}:${userId}:${action}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      const { data: existing } = await supabaseAdmin
        .from('rate_limits')
        .select('*')
        .eq('key', key)
        .single();

      if (!existing) {
        return this.config.maxRequests;
      }

      const existingWindowStart = new Date(existing.window_start).getTime();
      if (now - existingWindowStart >= this.config.windowMs) {
        return this.config.maxRequests;
      }

      return Math.max(0, this.config.maxRequests - existing.requests);
    } catch (error) {
      console.error('Failed to get remaining requests:', error);
      return this.config.maxRequests;
    }
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // API requests: 100 requests per minute
  api: new RateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'api'
  }),

  // Sync operations: 10 syncs per hour
  sync: new RateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'sync'
  }),

  // Analysis requests: 50 per hour
  analysis: new RateLimiter({
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'analysis'
  }),

  // Webhook processing: 1000 per hour
  webhook: new RateLimiter({
    maxRequests: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'webhook'
  })
};

// Middleware function for API routes
export async function withRateLimit(
  userId: string,
  action: keyof typeof rateLimiters,
  handler: () => Promise<any>
): Promise<any> {
  const limiter = rateLimiters[action];
  const result = await limiter.checkLimit(userId, action);

  if (!result.success) {
    throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
  }

  return handler();
}

// Utility function to get rate limit headers
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.remaining.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  };
}

// Legacy exports for backward compatibility
export const checkRateLimit = withRateLimit;
export const rateLimit = withRateLimit;
export const apiLimiter = rateLimiters.api;
export const syncLimiter = rateLimiters.sync;
export const analysisLimiter = rateLimiters.analysis;
export const authLimiter = rateLimiters.api;
export const dashboardLimiter = rateLimiters.api;