import { supabaseAdmin } from '@/lib/supabase/client';
import { APP_CONFIG } from '@/lib/config/constants';
import { logger } from '@/lib/logging/logger';
import { EmailService } from '@/lib/services/email-service';

export interface Trial {
  id: string;
  user_id: string;
  started_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'converted' | 'cancelled';
  limits: TrialLimits;
  usage: TrialUsage;
  conversion_data?: ConversionData;
}

export interface TrialLimits {
  ai_responses: number;
  team_members: number;
  integrations: number;
  tickets_per_month: number;
  storage_gb: number;
}

export interface TrialUsage {
  ai_responses_used: number;
  team_members_added: number;
  integrations_connected: number;
  tickets_processed: number;
  storage_used_gb: number;
}

export interface ConversionData {
  converted_at: string;
  plan_selected: string;
  billing_cycle: 'monthly' | 'yearly';
  conversion_reason: string;
  value_realized: boolean;
}

export class TrialManager {
  static TRIAL_DAYS = 14;
  static TRIAL_LIMITS: TrialLimits = {
    ai_responses: 100,
    team_members: 2,
    integrations: 1,
    tickets_per_month: 1000,
    storage_gb: 1
  };

  /**
   * Start a new trial for a user
   */
  static async startTrial(userId: string): Promise<Trial> {
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + (this.TRIAL_DAYS * 24 * 60 * 60 * 1000));

    const trial: Omit<Trial, 'id'> = {
      user_id: userId,
      started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
      limits: this.TRIAL_LIMITS,
      usage: {
        ai_responses_used: 0,
        team_members_added: 0,
        integrations_connected: 0,
        tickets_processed: 0,
        storage_used_gb: 0
      }
    };

    const { data, error } = await supabaseAdmin
      .from('trials')
      .insert(trial)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to start trial: ${error.message}`);
    }

    // Update user record
    await supabaseAdmin
      .from('users')
      .update({
        trial_started_at: startedAt.toISOString(),
        trial_expires_at: expiresAt.toISOString(),
        subscription_status: 'trialing'
      })
      .eq('id', userId);

    return data;
  }

  /**
   * Get current trial status for a user
   */
  static async getTrialStatus(userId: string): Promise<Trial | null> {
    const { data, error } = await supabaseAdmin
      .from('trials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to get trial status: ${error.message}`);
    }

    return data;
  }

  /**
   * Check if user is within trial limits
   */
  static async checkTrialLimits(userId: string, operation: keyof TrialUsage): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
  }> {
    const trial = await this.getTrialStatus(userId);
    
    if (!trial || trial.status !== 'active') {
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        used: 0
      };
    }

    // Map usage field to corresponding limit field
    const limitFieldMap: Record<keyof TrialUsage, keyof TrialLimits> = {
      ai_responses_used: 'ai_responses',
      team_members_added: 'team_members',
      integrations_connected: 'integrations',
      tickets_processed: 'tickets_per_month',
      storage_used_gb: 'storage_gb'
    };

    const limitField = limitFieldMap[operation];
    const limit = trial.limits[limitField] as number;
    const used = trial.usage[operation];
    const remaining = limit - used;

    return {
      allowed: remaining > 0,
      remaining,
      limit,
      used
    };
  }

  /**
   * Track trial usage
   */
  static async trackUsage(userId: string, operation: keyof TrialUsage, amount: number = 1): Promise<void> {
    const { error } = await supabaseAdmin
      .from('trials')
      .update({
        usage: `usage || jsonb_build_object('${operation}', (usage->>'${operation}')::int + ${amount})`
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      throw new Error(`Failed to track trial usage: ${error.message}`);
    }
  }

  /**
   * Convert trial to paid subscription
   */
  static async convertTrial(userId: string, planId: string, billingCycle: 'monthly' | 'yearly', reason: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('trials')
      .update({
        status: 'converted',
        conversion_data: {
          converted_at: new Date().toISOString(),
          plan_selected: planId,
          billing_cycle: billingCycle,
          conversion_reason: reason,
          value_realized: true
        }
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      throw new Error(`Failed to convert trial: ${error.message}`);
    }

    // Update user subscription status
    await supabaseAdmin
      .from('users')
      .update({
        subscription_plan: planId,
        subscription_status: 'active',
        billing_cycle: billingCycle,
        trial_converted_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  /**
   * Check if trial is expired
   */
  static async checkTrialExpiration(): Promise<void> {
    const { data: expiredTrials, error } = await supabaseAdmin
      .from('trials')
      .select('user_id')
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString());

    if (error) {
      await logger.error('Failed to check trial expiration:', error);
      return;
    }

    for (const trial of expiredTrials || []) {
      await this.expireTrial(trial.user_id);
    }
  }

  /**
   * Expire a trial
   */
  static async expireTrial(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('trials')
      .update({
        status: 'expired'
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      await logger.error('Failed to expire trial for user ${userId}:', error);
      return;
    }

    // Update user status
    await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'expired',
        trial_expired_at: new Date().toISOString()
      })
      .eq('id', userId);

    // Send expiration notification
    await this.sendTrialExpirationNotification(userId);
  }

  /**
   * Get trial conversion metrics
   */
  static async getConversionMetrics(): Promise<{
    total_trials: number;
    active_trials: number;
    converted_trials: number;
    expired_trials: number;
    conversion_rate: number;
    avg_trial_duration: number;
  }> {
    const { data: trials, error } = await supabaseAdmin
      .from('trials')
      .select('status, started_at, conversion_data');

    if (error) {
      throw new Error(`Failed to get conversion metrics: ${error.message}`);
    }

    const total = trials.length;
    const active = trials.filter(t => t.status === 'active').length;
    const converted = trials.filter(t => t.status === 'converted').length;
    const expired = trials.filter(t => t.status === 'expired').length;

    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    // Calculate average trial duration
    const completedTrials = trials.filter(t => t.status !== 'active');
    const avgDuration = completedTrials.length > 0 
      ? completedTrials.reduce((sum, trial) => {
          const start = new Date(trial.started_at);
          const end = trial.conversion_data?.converted_at 
            ? new Date(trial.conversion_data.converted_at)
            : new Date((trial as any).expires_at);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedTrials.length
      : 0;

    return {
      total_trials: total,
      active_trials: active,
      converted_trials: converted,
      expired_trials: expired,
      conversion_rate: conversionRate,
      avg_trial_duration: avgDuration
    };
  }

  /**
   * Send trial expiration notification
   */
  private static async sendTrialExpirationNotification(userId: string): Promise<void> {
    try {
      // Get user details
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (user?.email) {
        await EmailService.sendTrialExpirationEmail(
          user.email,
          user.full_name || 'there',
          0 // Trial has already expired
        );
      }
    } catch (error) {
      await logger.error('Failed to send trial expiration notification', error);
    }
  }
} 