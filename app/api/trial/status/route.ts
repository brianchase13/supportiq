import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TrialManager } from '@/lib/trial/manager';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trial status
    const trial = await TrialManager.getTrialStatus(user.id);

    if (!trial) {
      return NextResponse.json({
        has_trial: false,
        message: 'No trial found'
      });
    }

    // Calculate days remaining
    const now = new Date();
    const expiresAt = new Date(trial.expires_at);
    const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate usage percentages
    const usagePercentages = {
      ai_responses: (trial.usage.ai_responses_used / trial.limits.ai_responses) * 100,
      team_members: (trial.usage.team_members_added / trial.limits.team_members) * 100,
      integrations: (trial.usage.integrations_connected / trial.limits.integrations) * 100,
      tickets_per_month: (trial.usage.tickets_processed / trial.limits.tickets_per_month) * 100,
      storage_gb: (trial.usage.storage_used_gb / trial.limits.storage_gb) * 100
    };

    return NextResponse.json({
      has_trial: true,
      trial: {
        ...trial,
        days_remaining: daysRemaining,
        is_expired: trial.status === 'expired' || daysRemaining === 0,
        usage_percentages: usagePercentages
      }
    });

  } catch (error) {
    console.error('Error getting trial status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get trial status' },
      { status: 500 }
    );
  }
} 