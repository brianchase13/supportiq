import { createClient } from '@supabase/supabase-js';

interface GuaranteeTerms {
  duration_days: number;
  roi_threshold: number;
  satisfaction_threshold: number;
  deflection_threshold: number;
  refund_percentage: number;
  conditions: string[];
}

interface GuaranteeStatus {
  user_id: string;
  subscription_start: string;
  days_remaining: number;
  roi_achieved: number;
  satisfaction_achieved: number;
  deflection_achieved: number;
  qualifies_for_refund: boolean;
  refund_amount: number;
  refund_requested: boolean;
  refund_processed: boolean;
  refund_date?: string;
  guarantee_met: boolean;
}

interface RefundRequest {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  created_at: string;
  processed_at?: string;
  notes?: string;
}

interface GuaranteeMetrics {
  total_subscriptions: number;
  refunds_requested: number;
  refunds_processed: number;
  guarantee_success_rate: number;
  avg_roi_achieved: number;
  avg_satisfaction: number;
  avg_deflection_rate: number;
  total_refund_amount: number;
}

export class MoneyBackGuaranteeSystem {
  private supabase: any;
  private guaranteeTerms: GuaranteeTerms;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.guaranteeTerms = {
      duration_days: 30,
      roi_threshold: 500, // 500% ROI
      satisfaction_threshold: 4.0, // 4.0/5 satisfaction
      deflection_threshold: 50, // 50% deflection rate
      refund_percentage: 100, // 100% refund
      conditions: [
        'Must use the platform for at least 7 days',
        'Must connect at least one support channel',
        'Must have processed at least 10 tickets',
        'ROI must be below 500%',
        'Customer satisfaction must be below 4.0/5',
        'Deflection rate must be below 50%'
      ]
    };
  }

  async checkGuaranteeStatus(userId: string): Promise<GuaranteeStatus> {
    try {
      // Get user subscription
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Calculate days since subscription start
      const startDate = new Date(subscription.created_at);
      const currentDate = new Date();
      const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, this.guaranteeTerms.duration_days - daysSinceStart);

      // Get user metrics
      const metrics = await this.getUserMetrics(userId);
      
      // Check if user qualifies for refund
      const qualifiesForRefund = this.checkRefundEligibility(metrics, daysSinceStart);
      
      // Calculate refund amount
      const refundAmount = qualifiesForRefund ? subscription.amount : 0;

      // Check if guarantee was met
      const guaranteeMet = this.checkGuaranteeMet(metrics);

      // Get existing refund request
      const { data: refundRequest } = await this.supabase
        .from('refund_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('subscription_id', subscription.id)
        .single();

      const guaranteeStatus: GuaranteeStatus = {
        user_id: userId,
        subscription_start: subscription.created_at,
        days_remaining: daysRemaining,
        roi_achieved: metrics.roi_percentage,
        satisfaction_achieved: metrics.satisfaction_score,
        deflection_achieved: metrics.deflection_rate,
        qualifies_for_refund: qualifiesForRefund,
        refund_amount: refundAmount,
        refund_requested: !!refundRequest,
        refund_processed: refundRequest?.status === 'processed',
        refund_date: refundRequest?.processed_at,
        guarantee_met: guaranteeMet
      };

      // Store guarantee status
      await this.storeGuaranteeStatus(guaranteeStatus);

      return guaranteeStatus;
    } catch (error) {
      console.error('Error checking guarantee status:', error);
      throw error;
    }
  }

  private async getUserMetrics(userId: string): Promise<any> {
    try {
      // Get tickets data
      const { data: tickets } = await this.supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get deflection data
      const { data: deflections } = await this.supabase
        .from('deflection_responses')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate metrics
      const totalTickets = tickets?.length || 0;
      const deflectedTickets = deflections?.length || 0;
      const deflectionRate = totalTickets > 0 ? (deflectedTickets / totalTickets) * 100 : 0;

      // Calculate ROI (simplified)
      const monthlySavings = deflectedTickets * 25; // $25 per ticket
      const monthlyCost = 99;
      const roiPercentage = monthlyCost > 0 ? ((monthlySavings - monthlyCost) / monthlyCost) * 100 : 0;

      // Mock satisfaction score (would come from actual feedback)
      const satisfactionScore = 4.2;

      return {
        total_tickets: totalTickets,
        deflected_tickets: deflectedTickets,
        deflection_rate: deflectionRate,
        monthly_savings: monthlySavings,
        roi_percentage: roiPercentage,
        satisfaction_score: satisfactionScore
      };
    } catch (error) {
      console.error('Error getting user metrics:', error);
      return {
        total_tickets: 0,
        deflected_tickets: 0,
        deflection_rate: 0,
        monthly_savings: 0,
        roi_percentage: 0,
        satisfaction_score: 4.0
      };
    }
  }

  private checkRefundEligibility(metrics: any, daysSinceStart: number): boolean {
    // Must be within guarantee period
    if (daysSinceStart > this.guaranteeTerms.duration_days) {
      return false;
    }

    // Must have used the platform for at least 7 days
    if (daysSinceStart < 7) {
      return false;
    }

    // Must have processed at least 10 tickets
    if (metrics.total_tickets < 10) {
      return false;
    }

    // Check ROI threshold
    if (metrics.roi_percentage >= this.guaranteeTerms.roi_threshold) {
      return false;
    }

    // Check satisfaction threshold
    if (metrics.satisfaction_score >= this.guaranteeTerms.satisfaction_threshold) {
      return false;
    }

    // Check deflection threshold
    if (metrics.deflection_rate >= this.guaranteeTerms.deflection_threshold) {
      return false;
    }

    return true;
  }

  private checkGuaranteeMet(metrics: any): boolean {
    return (
      metrics.roi_percentage >= this.guaranteeTerms.roi_threshold &&
      metrics.satisfaction_score >= this.guaranteeTerms.satisfaction_threshold &&
      metrics.deflection_rate >= this.guaranteeTerms.deflection_threshold
    );
  }

  private async storeGuaranteeStatus(status: GuaranteeStatus): Promise<void> {
    try {
      await this.supabase
        .from('guarantee_status')
        .upsert({
          user_id: status.user_id,
          subscription_start: status.subscription_start,
          days_remaining: status.days_remaining,
          roi_achieved: status.roi_achieved,
          satisfaction_achieved: status.satisfaction_achieved,
          deflection_achieved: status.deflection_achieved,
          qualifies_for_refund: status.qualifies_for_refund,
          refund_amount: status.refund_amount,
          refund_requested: status.refund_requested,
          refund_processed: status.refund_processed,
          refund_date: status.refund_date,
          guarantee_met: status.guarantee_met,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error storing guarantee status:', error);
    }
  }

  async requestRefund(userId: string, reason: string): Promise<RefundRequest> {
    try {
      // Check guarantee status
      const guaranteeStatus = await this.checkGuaranteeStatus(userId);
      
      if (!guaranteeStatus.qualifies_for_refund) {
        throw new Error('User does not qualify for refund');
      }

      // Get subscription
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Create refund request
      const refundRequest: RefundRequest = {
        id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        subscription_id: subscription.id,
        amount: guaranteeStatus.refund_amount,
        reason,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('refund_requests')
        .insert(refundRequest)
        .select()
        .single();

      if (error) throw error;

      // Send notification to admin
      await this.notifyAdminOfRefundRequest(refundRequest);

      return data;
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  }

  async processRefund(refundRequestId: string, approved: boolean, notes?: string): Promise<void> {
    try {
      const { data: refundRequest } = await this.supabase
        .from('refund_requests')
        .select('*')
        .eq('id', refundRequestId)
        .single();

      if (!refundRequest) {
        throw new Error('Refund request not found');
      }

      const status = approved ? 'approved' : 'rejected';

      // Update refund request
      await this.supabase
        .from('refund_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
          notes
        })
        .eq('id', refundRequestId);

      if (approved) {
        // Process actual refund via payment processor
        await this.processPaymentRefund(refundRequest);
        
        // Cancel subscription
        await this.cancelSubscription(refundRequest.subscription_id);
        
        // Send refund confirmation email
        await this.sendRefundConfirmation(refundRequest);
      } else {
        // Send rejection email
        await this.sendRefundRejection(refundRequest, notes);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  private async processPaymentRefund(refundRequest: RefundRequest): Promise<void> {
    try {
      // This would integrate with your payment processor (Stripe, etc.)
      // For now, we'll just log the refund
      console.log(`Processing refund of $${refundRequest.amount} for user ${refundRequest.user_id}`);
      
      // Update guarantee status
      await this.supabase
        .from('guarantee_status')
        .update({
          refund_processed: true,
          refund_date: new Date().toISOString()
        })
        .eq('user_id', refundRequest.user_id);
    } catch (error) {
      console.error('Error processing payment refund:', error);
      throw error;
    }
  }

  private async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  }

  private async notifyAdminOfRefundRequest(refundRequest: RefundRequest): Promise<void> {
    try {
      // Send notification to admin team
      await this.supabase
        .from('admin_notifications')
        .insert({
          type: 'refund_request',
          title: 'New Refund Request',
          message: `User ${refundRequest.user_id} has requested a refund of $${refundRequest.amount}`,
          data: refundRequest,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  }

  private async sendRefundConfirmation(refundRequest: RefundRequest): Promise<void> {
    try {
      // Send email confirmation to user
      await this.supabase
        .from('email_queue')
        .insert({
          to: refundRequest.user_id,
          template: 'refund_confirmation',
          data: {
            amount: refundRequest.amount,
            refund_date: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending refund confirmation:', error);
    }
  }

  private async sendRefundRejection(refundRequest: RefundRequest, notes?: string): Promise<void> {
    try {
      // Send rejection email to user
      await this.supabase
        .from('email_queue')
        .insert({
          to: refundRequest.user_id,
          template: 'refund_rejection',
          data: {
            reason: notes || 'Does not meet guarantee terms',
            contact_info: 'support@supportiq.com'
          },
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending refund rejection:', error);
    }
  }

  async getGuaranteeMetrics(): Promise<GuaranteeMetrics> {
    try {
      // Get all guarantee statuses
      const { data: guaranteeStatuses } = await this.supabase
        .from('guarantee_status')
        .select('*');

      if (!guaranteeStatuses) {
        return {
          total_subscriptions: 0,
          refunds_requested: 0,
          refunds_processed: 0,
          guarantee_success_rate: 0,
          avg_roi_achieved: 0,
          avg_satisfaction: 0,
          avg_deflection_rate: 0,
          total_refund_amount: 0
        };
      }

      // Get refund requests
      const { data: refundRequests } = await this.supabase
        .from('refund_requests')
        .select('*');

      const totalSubscriptions = guaranteeStatuses.length;
      const refundsRequested = refundRequests?.filter(r => r.status !== 'rejected').length || 0;
      const refundsProcessed = refundRequests?.filter(r => r.status === 'processed').length || 0;
      const guaranteeSuccessRate = totalSubscriptions > 0 ? 
        ((totalSubscriptions - refundsProcessed) / totalSubscriptions) * 100 : 0;

      const avgRoi = guaranteeStatuses.reduce((sum, g) => sum + g.roi_achieved, 0) / totalSubscriptions;
      const avgSatisfaction = guaranteeStatuses.reduce((sum, g) => sum + g.satisfaction_achieved, 0) / totalSubscriptions;
      const avgDeflection = guaranteeStatuses.reduce((sum, g) => sum + g.deflection_achieved, 0) / totalSubscriptions;

      const totalRefundAmount = refundRequests
        ?.filter(r => r.status === 'processed')
        .reduce((sum, r) => sum + r.amount, 0) || 0;

      return {
        total_subscriptions: totalSubscriptions,
        refunds_requested: refundsRequested,
        refunds_processed: refundsProcessed,
        guarantee_success_rate: guaranteeSuccessRate,
        avg_roi_achieved: avgRoi,
        avg_satisfaction: avgSatisfaction,
        avg_deflection_rate: avgDeflection,
        total_refund_amount: totalRefundAmount
      };
    } catch (error) {
      console.error('Error getting guarantee metrics:', error);
      return {
        total_subscriptions: 0,
        refunds_requested: 0,
        refunds_processed: 0,
        guarantee_success_rate: 0,
        avg_roi_achieved: 0,
        avg_satisfaction: 0,
        avg_deflection_rate: 0,
        total_refund_amount: 0
      };
    }
  }

  getGuaranteeTerms(): GuaranteeTerms {
    return this.guaranteeTerms;
  }

  async updateGuaranteeTerms(terms: Partial<GuaranteeTerms>): Promise<void> {
    this.guaranteeTerms = { ...this.guaranteeTerms, ...terms };
    
    // Store updated terms
    await this.supabase
      .from('system_settings')
      .upsert({
        key: 'money_back_guarantee_terms',
        value: this.guaranteeTerms,
        updated_at: new Date().toISOString()
      });
  }
} 