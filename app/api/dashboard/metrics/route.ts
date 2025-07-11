import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardDataService } from '@/lib/dashboard/dashboard-data';
import { dashboardLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    const clientIP = request.ip || 'unknown';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(dashboardLimiter, clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Dashboard rate limit exceeded',
          retryAfter: rateLimitResult.msBeforeNext 
        },
        { status: 429 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    // Fetch dashboard metrics with resilient caching
    const dashboardService = new DashboardDataService(userId);
    const result = await dashboardService.getDashboardMetrics(forceRefresh);

    // Set appropriate cache headers
    const maxAge = result.fromCache ? 30 : 300; // 30s for cached, 5min for fresh
    
    const response = NextResponse.json({
      success: true,
      ...result
    });

    response.headers.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=600`);
    
    if (result.error) {
      response.headers.set('X-Cache-Status', 'stale');
      response.headers.set('X-Cache-Age', result.data.cacheAge.toString());
    } else {
      response.headers.set('X-Cache-Status', result.fromCache ? 'hit' : 'miss');
    }

    return response;

  } catch (error) {
    console.error('Dashboard metrics error:', error);
    
    // Return structured error with retry information
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard metrics',
        code: (error as any)?.code || 'UNKNOWN_ERROR',
        retryAfter: (error as any)?.retryAfter || 60000
      },
      { status: 500 }
    );
  }
}