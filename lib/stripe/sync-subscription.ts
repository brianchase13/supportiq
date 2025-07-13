import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/client';
import { TrialManager } from '@/lib/trial/manager';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface SubscriptionSyncResult {
  success: boolean;
  userId?: string;
  subscriptionId?: string;
  planId?: string;
  status?: string;
  error?: string;
}

export class SubscriptionSync {
  /**
   * Sync subscription from Stripe to database
   */
  static async syncSubscription(subscription: Stripe.Subscription): Promise<SubscriptionSyncResult> {
    try {
      const userId = subscription.metadata?.userId;
      const planId = subscription.metadata?.planId;
      const isTrialConversion = subscription.metadata?.isTrialConversion === 'true';

      if (!userId || !planId) {
        throw new Error('Missing required metadata in subscription');
      }

      console.log(`🔄 Syncing subscription ${subscription.id} for user ${userId}`);

      // Get customer details
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if (customer.deleted) {
        throw new Error('Customer has been deleted');
      }

      // Determine subscription status
      const status = this.mapStripeStatus(subscription.status);
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      // Update user subscription in database
      const { error: userError } = await supabaseAdmin
        .from('users')
        .update({
          subscription_plan: planId,
          subscription_status: status,
          stripe_customer_id: customer.id,
          stripe_subscription_id: subscription.id,
          billing_cycle: subscription.items.data[0]?.price.recurring?.interval || 'month',
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (userError) {
        throw new Error(`Failed to update user subscription: ${userError.message}`);
      }

      // Handle trial conversion
      if (isTrialConversion && status === 'active') {
        await this.handleTrialConversion(userId, planId, subscription);
      }

      // Update or create subscription record
      const { error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customer.id,
          stripe_price_id: subscription.items.data[0]?.price.id,
          status: status,
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          created_at: new Date(subscription.created * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'stripe_subscription_id'
        });

      if (subscriptionError) {
        console.error('Failed to upsert subscription record:', subscriptionError);
      }

      // Log subscription event
      await this.logSubscriptionEvent(userId, subscription.id, 'synced', {
        status,
        planId,
        isTrialConversion
      });

      console.log(`✅ Successfully synced subscription ${subscription.id}`);

      return {
        success: true,
        userId,
        subscriptionId: subscription.id,
        planId,
        status
      };

    } catch (error) {
      console.error('❌ Subscription sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle trial conversion to paid subscription
   */
  private static async handleTrialConversion(userId: string, planId: string, subscription: Stripe.Subscription): Promise<void> {
    try {
      console.log(`🔄 Converting trial for user ${userId} to plan ${planId}`);

      // Convert trial in database
      await TrialManager.convertTrial(userId, planId, 
        subscription.items.data[0]?.price.recurring?.interval as 'monthly' | 'yearly',
        'Stripe checkout completed'
      );

      // Update user limits based on plan
      await this.updateUserLimits(userId, planId);

      // Send welcome email for paid customers
      await this.sendWelcomeEmail(userId, planId);

      console.log(`✅ Trial conversion completed for user ${userId}`);

    } catch (error) {
      console.error('❌ Trial conversion failed:', error);
      throw error;
    }
  }

  /**
   * Update user limits based on subscription plan
   */
  private static async updateUserLimits(userId: string, planId: string): Promise<void> {
    const limits = this.getPlanLimits(planId);

    const { error } = await supabaseAdmin
      .from('user_settings')
      .upsert({
        user_id: userId,
        ai_responses_limit: limits.aiResponses,
        team_members_limit: limits.teamMembers,
        integrations_limit: limits.integrations,
        tickets_per_month_limit: limits.ticketsPerMonth,
        storage_gb_limit: limits.storageGb,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Failed to update user limits:', error);
    }
  }

  /**
   * Get plan limits based on subscription tier
   */
  private static getPlanLimits(planId: string) {
    switch (planId) {
      case 'starter':
        return {
          aiResponses: 1000,
          teamMembers: 3,
          integrations: 2,
          ticketsPerMonth: 5000,
          storageGb: 5
        };
      case 'growth':
        return {
          aiResponses: 10000,
          teamMembers: 10,
          integrations: 5,
          ticketsPerMonth: 50000,
          storageGb: 20
        };
      case 'enterprise':
        return {
          aiResponses: 100000,
          teamMembers: -1, // unlimited
          integrations: -1, // unlimited
          ticketsPerMonth: -1, // unlimited
          storageGb: 100
        };
      default:
        return {
          aiResponses: 100,
          teamMembers: 2,
          integrations: 1,
          ticketsPerMonth: 1000,
          storageGb: 1
        };
    }
  }

  /**
   * Map Stripe subscription status to our internal status
   */
  private static mapStripeStatus(stripeStatus: string): string {
    switch (stripeStatus) {
      case 'active':
        return 'active';
      case 'canceled':
        return 'canceled';
      case 'incomplete':
        return 'incomplete';
      case 'incomplete_expired':
        return 'expired';
      case 'past_due':
        return 'past_due';
      case 'trialing':
        return 'trialing';
      case 'unpaid':
        return 'unpaid';
      default:
        return 'unknown';
    }
  }

  /**
   * Handle subscription cancellation
   */
  static async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    console.log(`🔄 Handling subscription cancellation for user ${userId}`);

    // Update user status
    await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'canceled',
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    // Send cancellation email
    await this.sendCancellationEmail(userId);

    console.log(`✅ Subscription cancellation handled for user ${userId}`);
  }

  /**
   * Handle payment failure
   */
  static async handlePaymentFailure(invoice: Stripe.Invoice): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    console.log(`🔄 Handling payment failure for user ${userId}`);

    // Update user status
    await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    // Send payment failure email
    await this.sendPaymentFailureEmail(userId, invoice);

    console.log(`✅ Payment failure handled for user ${userId}`);
  }

  /**
   * Handle successful payment
   */
  static async handlePaymentSuccess(invoice: Stripe.Invoice): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    console.log(`🔄 Handling payment success for user ${userId}`);

    // Update user status if it was past_due
    await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('subscription_status', 'past_due');

    // Log payment event
    await this.logSubscriptionEvent(userId, subscription.id, 'payment_succeeded', {
      amount: invoice.amount_paid,
      currency: invoice.currency
    });

    console.log(`✅ Payment success handled for user ${userId}`);
  }

  /**
   * Log subscription events for analytics
   */
  private static async logSubscriptionEvent(
    userId: string, 
    subscriptionId: string, 
    eventType: string, 
    data: any
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('subscription_events')
      .insert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        event_type: eventType,
        event_data: data,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log subscription event:', error);
    }
  }

  /**
   * Send welcome email for new paid customers
   */
  private static async sendWelcomeEmail(userId: string, planId: string): Promise<void> {
    // TODO: Implement email sending
    console.log(`📧 Sending welcome email to user ${userId} for plan ${planId}`);
  }

  /**
   * Send cancellation email
   */
  private static async sendCancellationEmail(userId: string): Promise<void> {
    // TODO: Implement email sending
    console.log(`📧 Sending cancellation email to user ${userId}`);
  }

  /**
   * Send payment failure email
   */
  private static async sendPaymentFailureEmail(userId: string, invoice: Stripe.Invoice): Promise<void> {
    // TODO: Implement email sending
    console.log(`📧 Sending payment failure email to user ${userId}`);
  }
} 