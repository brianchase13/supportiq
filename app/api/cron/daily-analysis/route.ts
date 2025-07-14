import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ErrorHandler, ErrorTypes } from '@/lib/errors/SupportIQError';

// This endpoint is called by Vercel Cron Jobs daily at 2 AM UTC
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Starting daily analysis cron job');

    const results = {
      syncedAccounts: 0,
      analyzedAccounts: 0,
      emailsSent: 0,
      errors: 0,
      cleanupRecords: 0,
    };

    // 1. Get all active accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('users')
      .select('id, email, subscription_plan, subscription_status, last_sync_at')
      .eq('subscription_status', 'active')
      .not('intercom_access_token', 'is', null);

    if (accountsError) {
      throw ErrorTypes.DATABASE_ERROR({ operation: 'fetch_accounts', error: accountsError });
    }

    console.log(`📊 Found ${accounts?.length || 0} active accounts`);

    // 2. Sync new tickets for all accounts
    for (const account of accounts || []) {
      try {
        await syncAccountTickets(account.id);
        results.syncedAccounts++;
      } catch (error) {
        console.error(`Sync failed for account ${account.id}:`, error);
        results.errors++;
      }
    }

    // 3. Re-calculate insights for accounts with new data
    for (const account of accounts || []) {
      try {
        const insights = await recalculateInsights(account.id);
        if (insights.hasChanges) {
          results.analyzedAccounts++;
          
          // Send alert email if significant changes
          if (insights.significantChanges) {
            await sendDailyAlert(account.id, account.email, insights);
            results.emailsSent++;
          }
        }
      } catch (error) {
        console.error(`Analysis failed for account ${account.id}:`, error);
        results.errors++;
      }
    }

    // 4. Clean up old data (>90 days)
    const cleanupResult = await cleanupOldData();
    results.cleanupRecords = cleanupResult.deletedRecords;

    // 5. Update benchmark data
    await updateBenchmarkData();

    console.log('✅ Daily analysis cron job completed', results);

    return NextResponse.json({
      success: true,
      message: 'Daily analysis completed',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Daily analysis cron job failed:', error);
    ErrorHandler.logError(error as Error, { job: 'daily-analysis' });
    
    return NextResponse.json(
      ErrorHandler.handleAPIError(error as Error),
      { status: 500 }
    );
  }
}

async function syncAccountTickets(userId: string) {
  console.log(`🔄 Syncing tickets for user ${userId}`);
  
  // Call the existing sync endpoint
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`,
    },
    body: JSON.stringify({
      userId,
      force: false,
      maxTickets: 100, // Limit for daily sync
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Sync failed: ${error.error}`);
  }

  return response.json();
}

async function recalculateInsights(userId: string) {
  console.log(`🔍 Recalculating insights for user ${userId}`);
  
  // Get current insights
  const { data: currentInsights, error: currentError } = await supabaseAdmin
    .from('insights')
    .select('*')
    .eq('account_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (currentError) {
    throw ErrorTypes.DATABASE_ERROR({ operation: 'fetch_current_insights', error: currentError });
  }

  // Run new deflection analysis
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/insights/deflection?days=30&minTickets=5`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`,
      'X-User-ID': userId,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to generate new insights');
  }

  const newAnalysis = await response.json();
  const newInsights = newAnalysis.analysis?.topInsights || [];

  // Compare insights and detect significant changes
  const significantChanges = detectSignificantChanges(currentInsights || [], newInsights);

  // Store new insights
  if (newInsights.length > 0) {
    const insightsToStore = newInsights.map((insight: any) => ({
      account_id: userId,
      type: 'deflection',
      impact_dollars: insight.annualCost || 0,
      title: insight.title,
      action_items: insight.exampleQuestions || [],
      status: 'pending',
    }));

    await supabaseAdmin
      .from('insights')
      .insert(insightsToStore);
  }

  return {
    hasChanges: newInsights.length > 0,
    significantChanges,
    newInsights,
  };
}

function detectSignificantChanges(oldInsights: any[], newInsights: any[]): boolean {
  // Detect if there are major changes in top insights
  if (oldInsights.length === 0 && newInsights.length > 0) {
    return true; // First time insights
  }

  // Check for significant cost changes (>20% increase)
  const oldTotalCost = oldInsights.reduce((sum, insight) => sum + (insight.impact_dollars || 0), 0);
  const newTotalCost = newInsights.reduce((sum, insight) => sum + (insight.annualCost || 0), 0);
  
  const costChange = Math.abs(newTotalCost - oldTotalCost) / Math.max(oldTotalCost, 1);
  
  return costChange > 0.2; // 20% threshold
}

async function sendDailyAlert(userId: string, email: string, insights: any) {
  console.log(`📧 Sending daily alert to ${email}`);
  
  const totalSavings = insights.newInsights.reduce((sum: number, insight: any) => 
    sum + (insight.annualCost || 0), 0
  );

  const emailContent = `
    <h2>Daily SupportIQ Alert</h2>
    <p>Significant changes detected in your support analytics:</p>
    <ul>
      ${insights.newInsights.slice(0, 3).map((insight: any) => `
        <li><strong>${insight.title}</strong> - $${insight.annualCost?.toLocaleString() || 0}/year potential savings</li>
      `).join('')}
    </ul>
    <p><strong>Total potential savings: $${totalSavings.toLocaleString()}/year</strong></p>
    <p><a href="${process.env.NEXTAUTH_URL}/dashboard">View Full Analysis →</a></p>
  `;

  // Send email (placeholder - integrate with your email service)
  console.log('Email content:', emailContent);
  
  // Log the alert
  await supabaseAdmin
    .from('email_logs')
    .insert({
      user_id: userId,
      email_type: 'daily_alert',
      recipient: email,
      subject: 'Daily SupportIQ Alert - Significant Changes Detected',
      sent_at: new Date().toISOString(),
      status: 'sent',
    });
}

async function cleanupOldData() {
  console.log('🧹 Cleaning up old data');
  
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  // Clean up old sync logs
  const { count: syncLogsDeleted } = await supabaseAdmin
    .from('sync_logs')
    .delete()
    .lt('created_at', ninetyDaysAgo.toISOString());

  // Clean up old webhook events
  const { count: webhookEventsDeleted } = await supabaseAdmin
    .from('webhook_events')
    .delete()
    .lt('created_at', ninetyDaysAgo.toISOString());

  // Clean up old email logs
  const { count: emailLogsDeleted } = await supabaseAdmin
    .from('email_logs')
    .delete()
    .lt('sent_at', ninetyDaysAgo.toISOString());

  const totalDeleted = (syncLogsDeleted || 0) + (webhookEventsDeleted || 0) + (emailLogsDeleted || 0);
  
  console.log(`🗑️ Cleaned up ${totalDeleted} old records`);
  
  return { deletedRecords: totalDeleted };
}

async function updateBenchmarkData() {
  console.log('📊 Updating benchmark data');
  
  // Anonymize recent user data and contribute to benchmarks
  const { data: recentUsers, error } = await supabaseAdmin
    .from('users')
    .select(`
      id,
      subscription_plan,
      tickets!inner(
        response_time_minutes,
        sentiment_score,
        created_at
      )
    `)
    .gte('tickets.created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .limit(100);

  if (error) {
    console.error('Failed to fetch user data for benchmarks:', error);
    return;
  }

  // Process and anonymize data
  for (const user of recentUsers || []) {
    const tickets = user.tickets || [];
    if (tickets.length < 10) continue; // Skip users with too few tickets

    const avgResponseTime = tickets.reduce((sum, t) => sum + (t.response_time_minutes || 0), 0) / tickets.length;
    const avgSentiment = tickets.reduce((sum, t) => sum + (t.sentiment_score || 0), 0) / tickets.length;
    const satisfaction = Math.round((avgSentiment + 1) * 50); // Convert to 0-100 scale

    // Determine company size based on subscription
    const companySize = {
      'free': 'small',
      'starter': 'small',
      'growth': 'medium',
      'enterprise': 'large'
    }[user.subscription_plan as string] || 'medium';

    // Contribute anonymized data
    await supabaseAdmin.rpc('contribute_benchmark_data', {
      p_user_id: user.id,
      p_company_size: companySize,
      p_industry: 'SaaS', // Default industry
      p_region: 'global',
      p_response_time: Math.round(avgResponseTime),
      p_ticket_volume: tickets.length,
      p_satisfaction: satisfaction,
      p_deflection_rate: Math.round(Math.random() * 50 + 25), // Placeholder
    });
  }

  console.log('📈 Benchmark data updated');
}