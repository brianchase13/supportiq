import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const MetricsRequestSchema = z.object({
  date_range: z.enum(['7d', '30d', '90d', 'custom']).optional().default('30d'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  granularity: z.enum(['day', 'week', 'month']).optional().default('day'),
  metrics: z.array(z.enum([
    'deflection_rate',
    'customer_satisfaction',
    'cost_savings',
    'response_time',
    'volume_trends',
    'category_breakdown'
  ])).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const user = await auth.getUser(cookieStore);
    const userId = user?.id;
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await apiLimiter.checkLimit(clientIP, 'deflection_metrics');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const params = {
      date_range: url.searchParams.get('date_range') || '30d',
      start_date: url.searchParams.get('start_date'),
      end_date: url.searchParams.get('end_date'),
      granularity: url.searchParams.get('granularity') || 'day',
      metrics: url.searchParams.get('metrics')?.split(',') || [
        'deflection_rate',
        'customer_satisfaction',
        'cost_savings',
        'volume_trends'
      ],
    };

    const validationResult = MetricsRequestSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { date_range, start_date, end_date, granularity, metrics = [] } = validationResult.data;

    // Calculate date range
    const dateRange = calculateDateRange(date_range, start_date, end_date);

    // Fetch metrics data
    const metricsData = await Promise.all([
      metrics.includes('deflection_rate') ? getDeflectionRateMetrics(userId, dateRange, granularity) : null,
      metrics.includes('customer_satisfaction') ? getCustomerSatisfactionMetrics(userId, dateRange, granularity) : null,
      metrics.includes('cost_savings') ? getCostSavingsMetrics(userId, dateRange, granularity) : null,
      metrics.includes('response_time') ? getResponseTimeMetrics(userId, dateRange, granularity) : null,
      metrics.includes('volume_trends') ? getVolumeTrends(userId, dateRange, granularity) : null,
      metrics.includes('category_breakdown') ? getCategoryBreakdown(userId, dateRange) : null,
    ]);

    // Get summary statistics
    const summary = await getSummaryStatistics(userId, dateRange);

    // Get real-time stats
    const realTime = await getRealTimeStats(userId);

    return NextResponse.json({
      success: true,
      data: {
        deflection_rate: metricsData[0],
        customer_satisfaction: metricsData[1],
        cost_savings: metricsData[2],
        response_time: metricsData[3],
        volume_trends: metricsData[4],
        category_breakdown: metricsData[5],
      },
      summary,
      real_time: realTime,
      metadata: {
        date_range: dateRange,
        granularity,
        metrics_requested: metrics,
        generated_at: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Metrics retrieval error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Metrics retrieval failed' },
      { status: 500 }
    );
  }
}

function calculateDateRange(
  dateRange: string,
  startDate?: string,
  endDate?: string
): { start: string; end: string } {
  const now = new Date();
  const end = endDate ? new Date(endDate) : now;
  
  let start: Date;
  
  if (dateRange === 'custom' && startDate) {
    start = new Date(startDate);
  } else {
    const daysBack = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    }[dateRange] || 30;
    
    start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

async function getDeflectionRateMetrics(
  userId: string,
  dateRange: { start: string; end: string },
  granularity: string
) {
  try {
    const { data: metrics, error } = await supabaseAdmin
      .from('deflection_metrics')
      .select('date, total_tickets, auto_resolved, deflection_rate')
      .eq('user_id', userId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: true });

    if (error) {
      console.error('Deflection rate metrics error:', error);
      return null;
    }

    // Group by granularity if needed
    const groupedData = groupByGranularity(metrics || [], granularity);

    return {
      data: groupedData.map(item => ({
        date: item.date,
        deflection_rate: item.deflection_rate || 0,
        total_tickets: item.total_tickets || 0,
        auto_resolved: item.auto_resolved || 0,
      })),
      average: calculateAverage(groupedData, 'deflection_rate'),
      trend: calculateTrend(groupedData, 'deflection_rate'),
    };
  } catch (error) {
    console.error('Failed to get deflection rate metrics:', error);
    return null;
  }
}

async function getCustomerSatisfactionMetrics(
  userId: string,
  dateRange: { start: string; end: string },
  granularity: string
) {
  try {
    const { data: metrics, error } = await supabaseAdmin
      .from('deflection_metrics')
      .select('date, customer_satisfaction')
      .eq('user_id', userId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: true });

    if (error) {
      console.error('Customer satisfaction metrics error:', error);
      return null;
    }

    const groupedData = groupByGranularity(metrics || [], granularity);

    return {
      data: groupedData.map(item => ({
        date: item.date,
        satisfaction: (item.customer_satisfaction || 0) * 100, // Convert to percentage
      })),
      average: calculateAverage(groupedData, 'customer_satisfaction') * 100,
      trend: calculateTrend(groupedData, 'customer_satisfaction'),
    };
  } catch (error) {
    console.error('Failed to get customer satisfaction metrics:', error);
    return null;
  }
}

async function getCostSavingsMetrics(
  userId: string,
  dateRange: { start: string; end: string },
  granularity: string
) {
  try {
    const { data: metrics, error } = await supabaseAdmin
      .from('deflection_metrics')
      .select('date, cost_savings_usd')
      .eq('user_id', userId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: true });

    if (error) {
      console.error('Cost savings metrics error:', error);
      return null;
    }

    const groupedData = groupByGranularity(metrics || [], granularity, 'sum');

    return {
      data: groupedData.map(item => ({
        date: item.date,
        cost_savings: item.cost_savings_usd || 0,
      })),
      total: groupedData.reduce((sum, item) => sum + (item.cost_savings_usd || 0), 0),
      average_daily: calculateAverage(groupedData, 'cost_savings_usd'),
    };
  } catch (error) {
    console.error('Failed to get cost savings metrics:', error);
    return null;
  }
}

async function getResponseTimeMetrics(
  userId: string,
  dateRange: { start: string; end: string },
  granularity: string
) {
  try {
    const { data: metrics, error } = await supabaseAdmin
      .from('deflection_metrics')
      .select('date, avg_response_time_minutes')
      .eq('user_id', userId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: true });

    if (error) {
      console.error('Response time metrics error:', error);
      return null;
    }

    const groupedData = groupByGranularity(metrics || [], granularity);

    return {
      data: groupedData.map(item => ({
        date: item.date,
        avg_response_time: item.avg_response_time_minutes || 0,
      })),
      average: calculateAverage(groupedData, 'avg_response_time_minutes'),
      trend: calculateTrend(groupedData, 'avg_response_time_minutes'),
    };
  } catch (error) {
    console.error('Failed to get response time metrics:', error);
    return null;
  }
}

async function getVolumeTrends(
  userId: string,
  dateRange: { start: string; end: string },
  granularity: string
) {
  try {
    const { data: metrics, error } = await supabaseAdmin
      .from('deflection_metrics')
      .select('date, total_tickets, auto_resolved, escalated')
      .eq('user_id', userId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: true });

    if (error) {
      console.error('Volume trends error:', error);
      return null;
    }

    const groupedData = groupByGranularity(metrics || [], granularity, 'sum');

    return {
      data: groupedData.map(item => ({
        date: item.date,
        total_tickets: item.total_tickets || 0,
        auto_resolved: item.auto_resolved || 0,
        escalated: item.escalated || 0,
      })),
      totals: {
        total_tickets: groupedData.reduce((sum, item) => sum + (item.total_tickets || 0), 0),
        auto_resolved: groupedData.reduce((sum, item) => sum + (item.auto_resolved || 0), 0),
        escalated: groupedData.reduce((sum, item) => sum + (item.escalated || 0), 0),
      },
    };
  } catch (error) {
    console.error('Failed to get volume trends:', error);
    return null;
  }
}

async function getCategoryBreakdown(
  userId: string,
  dateRange: { start: string; end: string }
) {
  try {
    const { data: tickets, error } = await supabaseAdmin
      .from('tickets')
      .select('id, category, status')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    if (error) {
      console.error('Category breakdown error:', error);
      return null;
    }

    // Get AI responses for the same period
    const { data: aiResponses } = await supabaseAdmin
      .from('ai_responses')
      .select('ticket_id, response_type, confidence_score')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    // Create a map of ticket_id to AI response
    const aiResponseMap = new Map();
    aiResponses?.forEach(response => {
      aiResponseMap.set(response.ticket_id, response);
    });

    // Group by category
    const categoryStats: Record<string, any> = {};
    
    tickets?.forEach(ticket => {
      const category = ticket.category || 'uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          total: 0,
          auto_resolved: 0,
          escalated: 0,
          deflection_rate: 0,
        };
      }

      categoryStats[category].total += 1;

      const aiResponse = aiResponseMap.get(ticket.id);
      if (aiResponse?.response_type === 'auto_resolve') {
        categoryStats[category].auto_resolved += 1;
      } else {
        categoryStats[category].escalated += 1;
      }
    });

    // Calculate deflection rates
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.deflection_rate = stats.total > 0 ? stats.auto_resolved / stats.total : 0;
    });

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      ...stats,
    }));
  } catch (error) {
    console.error('Failed to get category breakdown:', error);
    return null;
  }
}

async function getSummaryStatistics(
  userId: string,
  dateRange: { start: string; end: string }
) {
  try {
    const { data: metrics, error } = await supabaseAdmin
      .from('deflection_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    if (error || !metrics || metrics.length === 0) {
      return {
        total_tickets: 0,
        total_auto_resolved: 0,
        total_escalated: 0,
        overall_deflection_rate: 0,
        average_satisfaction: 0,
        total_cost_savings: 0,
        average_response_time: 0,
      };
    }

    const totals = metrics.reduce(
      (acc, metric) => ({
        total_tickets: acc.total_tickets + (metric.total_tickets || 0),
        total_auto_resolved: acc.total_auto_resolved + (metric.auto_resolved || 0),
        total_escalated: acc.total_escalated + (metric.escalated || 0),
        total_cost_savings: acc.total_cost_savings + (metric.cost_savings_usd || 0),
        satisfaction_sum: acc.satisfaction_sum + (metric.customer_satisfaction || 0),
        response_time_sum: acc.response_time_sum + (metric.avg_response_time_minutes || 0),
        count: acc.count + 1,
      }),
      {
        total_tickets: 0,
        total_auto_resolved: 0,
        total_escalated: 0,
        total_cost_savings: 0,
        satisfaction_sum: 0,
        response_time_sum: 0,
        count: 0,
      }
    );

    return {
      total_tickets: totals.total_tickets,
      total_auto_resolved: totals.total_auto_resolved,
      total_escalated: totals.total_escalated,
      overall_deflection_rate: totals.total_tickets > 0 
        ? totals.total_auto_resolved / totals.total_tickets 
        : 0,
      average_satisfaction: totals.count > 0 
        ? totals.satisfaction_sum / totals.count 
        : 0,
      total_cost_savings: totals.total_cost_savings,
      average_response_time: totals.count > 0 
        ? totals.response_time_sum / totals.count 
        : 0,
    };
  } catch (error) {
    console.error('Failed to get summary statistics:', error);
    return {};
  }
}

async function getRealTimeStats(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayMetrics } = await supabaseAdmin
      .from('deflection_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Get recent AI responses (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentResponses } = await supabaseAdmin
      .from('ai_responses')
      .select('response_type, confidence_score, created_at')
      .eq('user_id', userId)
      .gte('created_at', yesterday);

    return {
      today: todayMetrics || {
        total_tickets: 0,
        auto_resolved: 0,
        escalated: 0,
        deflection_rate: 0,
        customer_satisfaction: 0,
      },
      last_24h: {
        total_responses: recentResponses?.length || 0,
        avg_confidence: recentResponses?.length 
          ? recentResponses.reduce((sum, r) => sum + r.confidence_score, 0) / recentResponses.length
          : 0,
        auto_resolved: recentResponses?.filter(r => r.response_type === 'auto_resolve').length || 0,
      },
    };
  } catch (error) {
    console.error('Failed to get real-time stats:', error);
    return {};
  }
}

function groupByGranularity(
  data: any[], 
  granularity: string, 
  aggregation: 'avg' | 'sum' = 'avg'
) {
  if (granularity === 'day') {
    return data;
  }

  // For week/month grouping, we'd implement more complex logic
  // For now, return daily data
  return data;
}

function calculateAverage(data: any[], field: string): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
  return sum / data.length;
}

function calculateTrend(data: any[], field: string): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';
  
  const recent = data.slice(-7); // Last 7 days
  const older = data.slice(-14, -7); // Previous 7 days
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = calculateAverage(recent, field);
  const olderAvg = calculateAverage(older, field);
  
  const change = (recentAvg - olderAvg) / olderAvg;
  
  if (change > 0.05) return 'up';
  if (change < -0.05) return 'down';
  return 'stable';
}