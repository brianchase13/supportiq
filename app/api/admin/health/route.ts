import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total customers
    const { count: totalCustomers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get trial users
    const { count: trialUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'trialing');

    // Get past due subscriptions
    const { count: pastDueSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'past_due');

    // Calculate revenue MTD (this would need to be calculated from Stripe data)
    const revenueMTD = 0; // TODO: Calculate from Stripe invoices for current month

    // Calculate churn rate (simplified calculation)
    const { count: canceledThisMonth } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'canceled')
      .gte('canceled_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const churnRate = (totalCustomers || 0) > 0 ? ((canceledThisMonth || 0) / (totalCustomers || 1)) * 100 : 0;

    // Determine system status based on various metrics
    let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if ((pastDueSubscriptions || 0) > 10 || churnRate > 5) {
      systemStatus = 'warning';
    }
    
    if ((pastDueSubscriptions || 0) > 20 || churnRate > 10) {
      systemStatus = 'critical';
    }

    // Get trial expiring soon (next 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const { count: trialExpiringSoon } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'trialing')
      .lte('trial_end_date', threeDaysFromNow.toISOString())
      .gte('trial_end_date', new Date().toISOString());

    // Get high churn risk customers (trial users with low usage)
    const { data: lowUsageTrialUsers } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        trial_end_date
      `)
      .eq('subscription_status', 'trialing')
      .lte('trial_end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()); // 7 days

    const churnRiskCount = lowUsageTrialUsers?.length || 0;

    return NextResponse.json({
      total_customers: totalCustomers || 0,
      active_subscriptions: activeSubscriptions || 0,
      trial_users: trialUsers || 0,
      revenue_mtd: revenueMTD,
      churn_rate: Math.round(churnRate * 100) / 100,
      system_status: systemStatus,
      past_due_subscriptions: pastDueSubscriptions || 0,
      trial_expiring_soon: trialExpiringSoon || 0,
      churn_risk_count: churnRiskCount,
      conversion_rate: (totalCustomers || 0) > 0 ? Math.round(((activeSubscriptions || 0) / (totalCustomers || 1)) * 10000) / 100 : 0
    });

  } catch (error) {
    console.error('Admin health API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 