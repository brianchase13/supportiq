import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Fetch conversion funnel data
    const conversionFunnel = await getConversionFunnel(startDateStr, endDateStr);
    
    // Fetch revenue metrics
    const revenueMetrics = await getRevenueMetrics(startDateStr, endDateStr);
    
    // Fetch usage metrics
    const usageMetrics = await getUsageMetrics(startDateStr, endDateStr);
    
    // Fetch time series data
    const timeSeriesData = await getTimeSeriesData(startDateStr, endDateStr);

    return NextResponse.json({
      conversionFunnel,
      revenueMetrics,
      usageMetrics,
      timeSeriesData,
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

async function getConversionFunnel(startDate: string, endDate: string) {
  // Landing page views (from analytics_events)
  const { count: landingPageViews } = await supabaseAdmin
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'landing_page_view')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Trial signups
  const { count: trialSignups } = await supabaseAdmin
    .from('trials')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // First AI use
  const { count: firstAIUse } = await supabaseAdmin
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'first_ai_response')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Limit reached
  const { count: limitReached } = await supabaseAdmin
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'trial_limit_reached')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Upgrades (paid conversions)
  const { count: upgrades } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  return {
    landingPageViews: landingPageViews || 0,
    trialSignups: trialSignups || 0,
    firstAIUse: firstAIUse || 0,
    limitReached: limitReached || 0,
    upgrades: upgrades || 0,
  };
}

async function getRevenueMetrics(startDate: string, endDate: string) {
  // Get active subscriptions
  const { data: activeSubscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('amount, billing_cycle')
    .eq('status', 'active');

  // Calculate MRR
  let mrr = 0;
  if (activeSubscriptions) {
    mrr = activeSubscriptions.reduce((total, sub) => {
      const monthlyAmount = sub.billing_cycle === 'yearly' ? sub.amount / 12 : sub.amount;
      return total + monthlyAmount;
    }, 0);
  }

  // Calculate ARR
  const arr = mrr * 12;

  // Get customer acquisition cost (simplified calculation)
  const { count: totalCustomers } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Assume $50 CAC for demo purposes
  const cac = 50;
  const ltv = mrr > 0 ? (mrr * 12) / (totalCustomers || 1) : 0;

  // Calculate churn rate
  const { count: churnedCustomers } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'canceled')
    .gte('updated_at', startDate)
    .lte('updated_at', endDate);

  const churnRate = totalCustomers && totalCustomers > 0 
    ? ((churnedCustomers || 0) / totalCustomers * 100).toFixed(1)
    : 0;

  return {
    mrr: Math.round(mrr),
    arr: Math.round(arr),
    ltv: Math.round(ltv),
    cac,
    churnRate: parseFloat(churnRate as string),
  };
}

async function getUsageMetrics(startDate: string, endDate: string) {
  // Active users (users with activity in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: activeUsers } = await supabaseAdmin
    .from('analytics_events')
    .select('user_id', { count: 'exact', head: true })
    .not('user_id', 'is', null)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .lte('created_at', endDate);

  // AI responses per user
  const { count: totalAIResponses } = await supabaseAdmin
    .from('ai_responses')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const aiResponsesPerUser = activeUsers && activeUsers > 0 
    ? (totalAIResponses || 0) / activeUsers 
    : 0;

  // Feature adoption (simplified)
  const featureAdoption = {
    aiResponses: 85,
    intercomIntegration: 65,
    knowledgeBase: 45,
    analytics: 78,
    customTemplates: 32,
  };

  return {
    activeUsers: activeUsers || 0,
    aiResponsesPerUser: Math.round(aiResponsesPerUser * 10) / 10,
    averageSessionTime: 8.5, // minutes
    featureAdoption,
  };
}

async function getTimeSeriesData(startDate: string, endDate: string) {
  // Generate time series data for the last 30 days
  const timeSeriesData = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Get trials for this date
    const { count: trials } = await supabaseAdmin
      .from('trials')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', currentDate.toISOString())
      .lt('created_at', new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString());

    // Get conversions for this date
    const { count: conversions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('created_at', currentDate.toISOString())
      .lt('created_at', new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString());

    // Calculate revenue for this date (simplified)
    const revenue = (conversions || 0) * 99; // Assume $99/month plan

    timeSeriesData.push({
      date: dateStr,
      trials: trials || 0,
      conversions: conversions || 0,
      revenue,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return timeSeriesData;
} 