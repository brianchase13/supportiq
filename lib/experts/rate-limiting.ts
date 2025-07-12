/**
 * Marc Lou's Production-Ready Rate Limiting
 * Simple, effective rate limiting for SaaS APIs
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration (Marc Lou's proven limits)
const RATE_LIMITS = {
  // Global limits (per IP)
  global: { requests: 1000, window: 60 * 60 * 1000 }, // 1000/hour
  
  // Authentication endpoints (strict)
  auth: { requests: 5, window: 60 * 1000 }, // 5/minute
  
  // API endpoints (per user)
  api: { requests: 100, window: 60 * 1000 }, // 100/minute
  
  // File uploads (limited)
  upload: { requests: 10, window: 60 * 60 * 1000 }, // 10/hour
  
  // AI analysis (expensive)
  ai: { requests: 20, window: 60 * 1000 }, // 20/minute
  
  // Webhook endpoints (external)
  webhook: { requests: 1000, window: 60 * 1000 } // 1000/minute
};

// In-memory store for rate limiting (Marc Lou's simple approach)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

/**
 * Rate limiting middleware (Marc Lou style - simple and effective)
 */
export function rateLimit(type: keyof typeof RATE_LIMITS) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const config = RATE_LIMITS[type];
    const now = Date.now();
    
    // Get identifier (IP for global, user ID for authenticated)
    const identifier = getIdentifier(request, type);
    const key = `${type}:${identifier}`;
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + config.window };
      rateLimitStore.set(key, entry);
    }
    
    // Check if limit exceeded
    if (entry.count >= config.requests) {
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${resetIn} seconds.`,
          retryAfter: resetIn
        },
        { 
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': config.requests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString()
          }
        }
      );
    }
    
    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);
    
    // Add rate limit headers (helpful for debugging)
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', config.requests.toString());
    response.headers.set('X-RateLimit-Remaining', (config.requests - entry.count).toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());
    
    return null; // Continue processing
  };
}

/**
 * Get identifier for rate limiting
 */
function getIdentifier(request: NextRequest, type: string): string {
  // For auth endpoints, use IP only
  if (type === 'auth' || type === 'global') {
    return getClientIP(request);
  }
  
  // For authenticated endpoints, try to get user ID
  const userId = getUserId(request);
  if (userId) {
    return userId;
  }
  
  // Fallback to IP
  return getClientIP(request);
}

/**
 * Extract client IP address
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for real IP (Vercel/Cloudflare)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (xRealIP) return xRealIP;
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  
  // Fallback (shouldn't happen in production)
  return 'unknown';
}

/**
 * Extract user ID from request (for authenticated rate limiting)
 */
function getUserId(request: NextRequest): string | null {
  try {
    // Check for session cookie or auth header
    const sessionCookie = request.cookies.get('session')?.value;
    if (sessionCookie) {
      // Parse session to get user ID (implement based on your auth system)
      // This is a placeholder - implement actual session parsing
      return 'user_id_from_session';
    }
    
    // Check for API key in header
    const apiKey = request.headers.get('authorization');
    if (apiKey?.startsWith('Bearer ')) {
      // Extract user ID from API key (implement based on your system)
      return 'user_id_from_api_key';
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting user ID for rate limiting:', error);
    return null;
  }
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit<T extends any[]>(
  type: keyof typeof RATE_LIMITS,
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(type)(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Continue with original handler
    return handler(...args);
  };
}

/**
 * Rate limiting for specific endpoints (usage examples)
 */

// Auth endpoints
export const authRateLimit = withRateLimit('auth', async (request: NextRequest) => {
  // Your auth logic here
  return NextResponse.json({ success: true });
});

// API endpoints
export const apiRateLimit = withRateLimit('api', async (request: NextRequest) => {
  // Your API logic here
  return NextResponse.json({ data: 'api response' });
});

// Upload endpoints
export const uploadRateLimit = withRateLimit('upload', async (request: NextRequest) => {
  // Your upload logic here
  return NextResponse.json({ uploaded: true });
});

// AI analysis endpoints (expensive operations)
export const aiRateLimit = withRateLimit('ai', async (request: NextRequest) => {
  // Your AI logic here
  return NextResponse.json({ analysis: 'complete' });
});

/**
 * Custom rate limiting for business logic
 */
export class BusinessRateLimit {
  // Limit expensive operations per customer
  static async checkCustomerUsage(customerId: string, operation: string): Promise<boolean> {
    const limits = {
      'ticket_analysis': { requests: 100, window: 24 * 60 * 60 * 1000 }, // 100/day
      'report_generation': { requests: 10, window: 60 * 60 * 1000 }, // 10/hour
      'integration_sync': { requests: 5, window: 60 * 60 * 1000 } // 5/hour
    };
    
    const limit = limits[operation as keyof typeof limits];
    if (!limit) return true; // No limit defined
    
    const key = `business:${operation}:${customerId}`;
    const now = Date.now();
    
    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + limit.window };
      rateLimitStore.set(key, entry);
    }
    
    if (entry.count >= limit.requests) {
      return false; // Limit exceeded
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    return true; // Within limits
  }
  
  // Get usage stats for customer dashboard
  static getCustomerUsage(customerId: string): Record<string, any> {
    const operations = ['ticket_analysis', 'report_generation', 'integration_sync'];
    const usage: Record<string, any> = {};
    
    for (const operation of operations) {
      const key = `business:${operation}:${customerId}`;
      const entry = rateLimitStore.get(key);
      
      usage[operation] = {
        used: entry?.count || 0,
        resetTime: entry?.resetTime || Date.now()
      };
    }
    
    return usage;
  }
}

/**
 * Rate limit status for monitoring
 */
export function getRateLimitStats(): Record<string, any> {
  const stats: Record<string, any> = {};
  
  for (const [key, value] of rateLimitStore.entries()) {
    const [type, identifier] = key.split(':');
    
    if (!stats[type]) {
      stats[type] = { totalKeys: 0, totalRequests: 0 };
    }
    
    stats[type].totalKeys++;
    stats[type].totalRequests += value.count;
  }
  
  return {
    totalEntries: rateLimitStore.size,
    byType: stats,
    memoryUsage: process.memoryUsage()
  };
}