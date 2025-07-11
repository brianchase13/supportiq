import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ErrorHandler, ErrorTypes } from '@/lib/errors/SupportIQError';

// This endpoint is called by Vercel Cron Jobs hourly to check usage limits
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📊 Starting usage limits check');

    const results = {
      checkedUsers: 0,
      warningsSent: 0,
      limitsEnforced: 0,
      upgradePrompts: 0,
      errors: 0,
    };

    // Get all active users with their usage and limits
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        name,
        subscription_plan,
        subscription_status,
        usage_current,
        usage_limit,
        last_usage_warning_at,
        last_limit_enforcement_at
      `)
      .eq('subscription_status', 'active');

    if (usersError) {
      throw ErrorTypes.DATABASE_ERROR({ operation: 'fetch_users', error: usersError });
    }

    console.log(`👥 Checking ${users?.length || 0} active users`);

    for (const user of users || []) {
      try {
        results.checkedUsers++;
        
        // Calculate current usage
        const currentUsage = await calculateCurrentUsage(user.id);
        const usageLimit = getUserUsageLimit(user.subscription_plan);
        const usagePercentage = (currentUsage / usageLimit) * 100;

        // Update user's current usage
        await supabaseAdmin
          .from('users')
          .update({
            usage_current: currentUsage,
            usage_limit: usageLimit,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        // Check if user needs warnings or enforcement
        if (usagePercentage >= 100) {
          // Hard limit reached
          await enforceUsageLimit(user);
          results.limitsEnforced++;
        } else if (usagePercentage >= 80) {
          // Warning threshold
          const shouldSendWarning = await shouldSendUsageWarning(user);
          if (shouldSendWarning) {
            await sendUsageWarning(user, usagePercentage, currentUsage, usageLimit);
            results.warningsSent++;
          }
        }

        // Check if user should receive upgrade prompt
        if (usagePercentage >= 90) {
          const roi = await calculateUpgradeROI(user);
          if (roi.shouldPrompt) {
            await sendUpgradePrompt(user, roi);
            results.upgradePrompts++;
          }
        }

      } catch (error) {
        console.error(`Usage check failed for user ${user.id}:`, error);
        results.errors++;
      }
    }

    console.log('✅ Usage limits check completed', results);

    return NextResponse.json({
      success: true,
      message: 'Usage limits check completed',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Usage limits cron job failed:', error);
    ErrorHandler.logError(error as Error, { job: 'usage-limits' });
    
    return NextResponse.json(
      ErrorHandler.handleAPIError(error as Error),
      { status: 500 }
    );
  }
}

async function calculateCurrentUsage(userId: string): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Count tickets analyzed in the last 30 days
  const { count: ticketsAnalyzed, error } = await supabaseAdmin
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('category', 'is', null)
    .gte('analyzed_at', thirtyDaysAgo.toISOString());

  if (error) {
    throw ErrorTypes.DATABASE_ERROR({ operation: 'calculate_usage', error });
  }

  return ticketsAnalyzed || 0;
}

function getUserUsageLimit(subscriptionPlan: string): number {
  const limits = {
    'free': 100,
    'starter': 1000,
    'growth': 10000,
    'enterprise': 100000,
  };

  return limits[subscriptionPlan as keyof typeof limits] || limits.free;
}

async function shouldSendUsageWarning(user: any): Promise<boolean> {
  // Only send warning once per day
  if (user.last_usage_warning_at) {
    const lastWarning = new Date(user.last_usage_warning_at);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    if (lastWarning > dayAgo) {
      return false;
    }
  }

  return true;
}

async function sendUsageWarning(user: any, usagePercentage: number, currentUsage: number, usageLimit: number) {
  console.log(`⚠️ Sending usage warning to ${user.email}`);

  const emailContent = generateUsageWarningEmail(user, usagePercentage, currentUsage, usageLimit);
  
  // Send email (placeholder - integrate with your email service)
  console.log('Usage warning email:', emailContent);

  // Log the warning
  await supabaseAdmin
    .from('email_logs')
    .insert({
      user_id: user.id,
      email_type: 'usage_warning',
      recipient: user.email,
      subject: `SupportIQ Usage Warning - ${Math.round(usagePercentage)}% of limit reached`,
      sent_at: new Date().toISOString(),
      status: 'sent',
    });

  // Update last warning timestamp
  await supabaseAdmin
    .from('users')
    .update({
      last_usage_warning_at: new Date().toISOString(),
    })
    .eq('id', user.id);
}

async function enforceUsageLimit(user: any) {
  console.log(`🚫 Enforcing usage limit for ${user.email}`);

  // Log the enforcement
  await supabaseAdmin
    .from('usage_enforcement_logs')
    .insert({
      user_id: user.id,
      action: 'limit_reached',
      usage_at_enforcement: user.usage_current,
      limit_at_enforcement: user.usage_limit,
      enforced_at: new Date().toISOString(),
    });

  // Send limit reached email
  const emailContent = generateLimitReachedEmail(user);
  
  // Send email (placeholder)
  console.log('Limit reached email:', emailContent);

  await supabaseAdmin
    .from('email_logs')
    .insert({
      user_id: user.id,
      email_type: 'limit_reached',
      recipient: user.email,
      subject: 'SupportIQ Usage Limit Reached - Action Required',
      sent_at: new Date().toISOString(),
      status: 'sent',
    });

  // Update enforcement timestamp
  await supabaseAdmin
    .from('users')
    .update({
      last_limit_enforcement_at: new Date().toISOString(),
    })
    .eq('id', user.id);
}

async function calculateUpgradeROI(user: any): Promise<{ shouldPrompt: boolean; roi: any }> {
  // Get user's deflection analysis
  const { data: analysis, error } = await supabaseAdmin
    .from('deflection_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !analysis) {
    return { shouldPrompt: false, roi: null };
  }

  const potentialSavings = analysis.total_potential_savings || 0;
  const nextPlanCost = getNextPlanCost(user.subscription_plan);
  
  // Calculate ROI
  const annualSavings = potentialSavings;
  const annualCost = nextPlanCost * 12;
  const roiMultiplier = annualSavings / annualCost;

  // Only prompt if ROI > 3x
  const shouldPrompt = roiMultiplier > 3;

  return {
    shouldPrompt,
    roi: {
      annualSavings,
      annualCost,
      roiMultiplier,
      nextPlan: getNextPlan(user.subscription_plan),
    },
  };
}

function getNextPlan(currentPlan: string): string {
  const progression = {
    'free': 'starter',
    'starter': 'growth',
    'growth': 'enterprise',
    'enterprise': 'enterprise',
  };

  return progression[currentPlan as keyof typeof progression] || 'starter';
}

function getNextPlanCost(currentPlan: string): number {
  const costs = {
    'free': 149, // Starter cost
    'starter': 449, // Growth cost
    'growth': 1249, // Enterprise cost
    'enterprise': 1249, // Already at top tier
  };

  return costs[currentPlan as keyof typeof costs] || costs.free;
}

async function sendUpgradePrompt(user: any, roi: any) {
  console.log(`📈 Sending upgrade prompt to ${user.email}`);

  const emailContent = generateUpgradePromptEmail(user, roi);
  
  // Send email (placeholder)
  console.log('Upgrade prompt email:', emailContent);

  await supabaseAdmin
    .from('email_logs')
    .insert({
      user_id: user.id,
      email_type: 'upgrade_prompt',
      recipient: user.email,
      subject: `Unlock $${roi.roi.annualSavings.toLocaleString()} in savings with SupportIQ ${roi.roi.nextPlan}`,
      sent_at: new Date().toISOString(),
      status: 'sent',
    });
}

function generateUsageWarningEmail(user: any, usagePercentage: number, currentUsage: number, usageLimit: number): string {
  return `
    <h2>⚠️ Usage Warning - ${Math.round(usagePercentage)}% of your limit reached</h2>
    <p>Hi ${user.name || user.email},</p>
    <p>You've analyzed <strong>${currentUsage.toLocaleString()}</strong> out of your <strong>${usageLimit.toLocaleString()}</strong> monthly tickets.</p>
    <p>At your current pace, you may hit your limit before the month ends.</p>
    <h3>What happens when you reach your limit?</h3>
    <ul>
      <li>New ticket analysis will be paused</li>
      <li>Existing insights remain available</li>
      <li>Dashboard continues to work normally</li>
    </ul>
    <p><a href="${process.env.NEXTAUTH_URL}/pricing">Upgrade your plan</a> to continue analyzing tickets without interruption.</p>
  `;
}

function generateLimitReachedEmail(user: any): string {
  return `
    <h2>🚫 Usage Limit Reached</h2>
    <p>Hi ${user.name || user.email},</p>
    <p>You've reached your monthly ticket analysis limit of <strong>${user.usage_limit?.toLocaleString()}</strong> tickets.</p>
    <p>Your account is temporarily paused for new analysis, but all existing insights remain available.</p>
    <h3>To continue analyzing tickets:</h3>
    <ol>
      <li><a href="${process.env.NEXTAUTH_URL}/pricing">Upgrade your plan</a> for instant access</li>
      <li>Or wait until your limit resets next month</li>
    </ol>
    <p><strong>Don't lose momentum!</strong> Upgrade now to keep optimizing your support operations.</p>
  `;
}

function generateUpgradePromptEmail(user: any, roi: any): string {
  return `
    <h2>💰 You're leaving $${roi.roi.annualSavings.toLocaleString()} on the table</h2>
    <p>Hi ${user.name || user.email},</p>
    <p>Based on your current usage, you could save <strong>$${roi.roi.annualSavings.toLocaleString()}/year</strong> by upgrading to SupportIQ ${roi.roi.nextPlan}.</p>
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>ROI Calculator:</h3>
      <p>💰 Annual Savings: $${roi.roi.annualSavings.toLocaleString()}</p>
      <p>💳 Annual Cost: $${roi.roi.annualCost.toLocaleString()}</p>
      <p>📈 ROI: ${roi.roi.roiMultiplier.toFixed(1)}x return</p>
    </div>
    <p>You're hitting your usage limits because you're getting value from SupportIQ. Let's unlock the full potential!</p>
    <p><a href="${process.env.NEXTAUTH_URL}/pricing">Upgrade to ${roi.roi.nextPlan}</a> and start saving more money today.</p>
  `;
}