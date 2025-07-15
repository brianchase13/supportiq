import { createClient } from '@supabase/supabase-js';

interface CustomerMetrics {
  total_tickets: number;
  avg_ticket_cost: number;
  agent_hourly_rate: number;
  avg_tickets_per_month: number;
  current_deflection_rate: number;
  target_deflection_rate: number;
  team_size: number;
  avg_response_time_hours: number;
  target_response_time_hours: number;
  customer_satisfaction_score: number;
  target_satisfaction_score: number;
}

interface ValueCalculation {
  monthly_savings: number;
  annual_savings: number;
  roi_percentage: number;
  payback_period_months: number;
  value_metrics: {
    ticket_deflection_savings: number;
    response_time_savings: number;
    satisfaction_improvement_value: number;
    agent_efficiency_gains: number;
    customer_retention_value: number;
  };
  personalized_recommendations: string[];
  confidence_score: number;
}

interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  value_threshold: number;
  recommended_for: string;
  savings_multiplier: number;
}

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  avg_tickets_per_month: number;
  avg_team_size: number;
  typical_savings: number;
  recommended_tier: string;
}

export class ValueBasedPricingCalculator {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async calculateCustomerValue(userId: string): Promise<ValueCalculation> {
    try {
      // Get customer metrics
      const metrics = await this.getCustomerMetrics(userId);
      
      // Calculate various savings components
      const ticketDeflectionSavings = this.calculateTicketDeflectionSavings(metrics);
      const responseTimeSavings = this.calculateResponseTimeSavings(metrics);
      const satisfactionValue = this.calculateSatisfactionValue(metrics);
      const efficiencyGains = this.calculateEfficiencyGains(metrics);
      const retentionValue = this.calculateRetentionValue(metrics);

      const monthlySavings = ticketDeflectionSavings + responseTimeSavings + satisfactionValue + efficiencyGains + retentionValue;
      const annualSavings = monthlySavings * 12;

      // Calculate ROI (assuming $99/month base price)
      const monthlyCost = 99;
      const roiPercentage = ((monthlySavings - monthlyCost) / monthlyCost) * 100;
      const paybackPeriodMonths = monthlyCost / monthlySavings;

      // Generate personalized recommendations
      const recommendations = this.generateRecommendations(metrics, monthlySavings);

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(metrics);

      return {
        monthly_savings: Math.round(monthlySavings),
        annual_savings: Math.round(annualSavings),
        roi_percentage: Math.round(roiPercentage),
        payback_period_months: Math.round(paybackPeriodMonths * 10) / 10,
        value_metrics: {
          ticket_deflection_savings: Math.round(ticketDeflectionSavings),
          response_time_savings: Math.round(responseTimeSavings),
          satisfaction_improvement_value: Math.round(satisfactionValue),
          agent_efficiency_gains: Math.round(efficiencyGains),
          customer_retention_value: Math.round(retentionValue)
        },
        personalized_recommendations: recommendations,
        confidence_score: confidenceScore
      };
    } catch (error) {
      console.error('Error calculating customer value:', error);
      throw error;
    }
  }

  private async getCustomerMetrics(userId: string): Promise<CustomerMetrics> {
    try {
      // Get historical ticket data
      const { data: tickets } = await this.supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      // Get user settings/profile
      const { data: userProfile } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Get team size
      const { data: teamMembers } = await this.supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true);

      // Calculate metrics
      const totalTickets = tickets?.length || 0;
      const avgTicketsPerMonth = totalTickets / 3; // 90 days = 3 months
      
      // Default values with realistic estimates
      const metrics: CustomerMetrics = {
        total_tickets: totalTickets,
        avg_ticket_cost: 25, // $25 per ticket
        agent_hourly_rate: 25, // $25/hour
        avg_tickets_per_month: avgTicketsPerMonth,
        current_deflection_rate: 0.15, // 15% current deflection
        target_deflection_rate: 0.68, // 68% target deflection
        team_size: teamMembers?.length || 3,
        avg_response_time_hours: 8.5, // 8.5 hours average
        target_response_time_hours: 2.3, // 2.3 hours target
        customer_satisfaction_score: 4.1, // 4.1/5 current
        target_satisfaction_score: 4.5 // 4.5/5 target
      };

      // Override with actual data if available
      if (tickets && tickets.length > 0) {
        const responseTimes = tickets
          .filter((t: { resolution_time_hours?: number }) => t.resolution_time_hours)
          .map((t: { resolution_time_hours?: number }) => t.resolution_time_hours);
        
        if (responseTimes.length > 0) {
          metrics.avg_response_time_hours = responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length;
        }

        // Calculate current deflection rate from actual data
        const autoResolved = tickets.filter((t: { status?: string, auto_resolved?: boolean }) => t.status === 'resolved' && t.auto_resolved).length;
        metrics.current_deflection_rate = totalTickets > 0 ? autoResolved / totalTickets : 0.15;
      }

      return metrics;
    } catch (error) {
      console.error('Error getting customer metrics:', error);
      // Return default metrics
      return {
        total_tickets: 0,
        avg_ticket_cost: 25,
        agent_hourly_rate: 25,
        avg_tickets_per_month: 50,
        current_deflection_rate: 0.15,
        target_deflection_rate: 0.68,
        team_size: 3,
        avg_response_time_hours: 8.5,
        target_response_time_hours: 2.3,
        customer_satisfaction_score: 4.1,
        target_satisfaction_score: 4.5
      };
    }
  }

  private calculateTicketDeflectionSavings(metrics: CustomerMetrics): number {
    const currentDeflected = metrics.avg_tickets_per_month * metrics.current_deflection_rate;
    const targetDeflected = metrics.avg_tickets_per_month * metrics.target_deflection_rate;
    const additionalDeflected = targetDeflected - currentDeflected;
    
    // Savings = additional tickets deflected * cost per ticket
    return additionalDeflected * metrics.avg_ticket_cost;
  }

  private calculateResponseTimeSavings(metrics: CustomerMetrics): number {
    const timeReduction = metrics.avg_response_time_hours - metrics.target_response_time_hours;
    const ticketsPerMonth = metrics.avg_tickets_per_month;
    
    // Savings = time reduction * tickets per month * hourly rate
    return timeReduction * ticketsPerMonth * metrics.agent_hourly_rate;
  }

  private calculateSatisfactionValue(metrics: CustomerMetrics): number {
    const satisfactionImprovement = metrics.target_satisfaction_score - metrics.customer_satisfaction_score;
    
    // Value of satisfaction improvement (estimated $50 per 0.1 point improvement)
    return satisfactionImprovement * 500; // $50 * 10 (for 0.1 increments)
  }

  private calculateEfficiencyGains(metrics: CustomerMetrics): number {
    // Efficiency gains from better ticket routing and automation
    const efficiencyImprovement = 0.15; // 15% efficiency improvement
    const monthlyAgentHours = metrics.team_size * 160; // 160 hours per month per agent
    
    return monthlyAgentHours * metrics.agent_hourly_rate * efficiencyImprovement;
  }

  private calculateRetentionValue(metrics: CustomerMetrics): number {
    // Value of improved customer retention
    const retentionImprovement = 0.05; // 5% improvement in retention
    const avgCustomerValue = 1000; // Average customer lifetime value
    
    // Estimate based on ticket volume and customer value
    return metrics.avg_tickets_per_month * avgCustomerValue * retentionImprovement * 0.1;
  }

  private generateRecommendations(metrics: CustomerMetrics, monthlySavings: number): string[] {
    const recommendations: string[] = [];

    if (metrics.current_deflection_rate < 0.3) {
      recommendations.push('Implement AI auto-responses to increase deflection rate from 15% to 68%');
    }

    if (metrics.avg_response_time_hours > 4) {
      recommendations.push('Reduce response time from 8.5 hours to 2.3 hours with intelligent routing');
    }

    if (metrics.customer_satisfaction_score < 4.3) {
      recommendations.push('Improve customer satisfaction with faster, more accurate responses');
    }

    if (metrics.team_size > 5) {
      recommendations.push('Scale support operations efficiently with AI automation');
    }

    if (monthlySavings > 5000) {
      recommendations.push('Consider enterprise features for additional automation and analytics');
    }

    return recommendations;
  }

  private calculateConfidenceScore(metrics: CustomerMetrics): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on data quality
    if (metrics.total_tickets > 100) confidence += 0.1;
    if (metrics.total_tickets > 500) confidence += 0.1;
    
    // Adjust based on team size
    if (metrics.team_size > 2) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  async getPricingTiers(): Promise<PricingTier[]> {
    return [
      {
        id: 'starter',
        name: 'Starter',
        price: 99,
        features: [
          'AI ticket analysis',
          'Basic auto-responses',
          'Email support',
          'Basic analytics'
        ],
        value_threshold: 2000,
        recommended_for: 'Small teams (1-3 agents)',
        savings_multiplier: 1.0
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 299,
        features: [
          'Advanced AI automation',
          'Custom response templates',
          'Priority support',
          'Advanced analytics',
          'Team collaboration',
          'API access'
        ],
        value_threshold: 8000,
        recommended_for: 'Growing teams (4-10 agents)',
        savings_multiplier: 1.5
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 799,
        features: [
          'Full AI automation suite',
          'Custom integrations',
          'Dedicated support',
          'Advanced reporting',
          'Multi-team management',
          'Custom AI training',
          'SLA guarantees'
        ],
        value_threshold: 25000,
        recommended_for: 'Large teams (10+ agents)',
        savings_multiplier: 2.0
      }
    ];
  }

  async getCustomerSegments(): Promise<CustomerSegment[]> {
    return [
      {
        id: 'startup',
        name: 'Startup',
        description: 'Early-stage companies with growing support needs',
        avg_tickets_per_month: 50,
        avg_team_size: 2,
        typical_savings: 1500,
        recommended_tier: 'starter'
      },
      {
        id: 'sme',
        name: 'Small-Medium Business',
        description: 'Established businesses with dedicated support teams',
        avg_tickets_per_month: 200,
        avg_team_size: 5,
        typical_savings: 6000,
        recommended_tier: 'professional'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Large organizations with complex support operations',
        avg_tickets_per_month: 1000,
        avg_team_size: 15,
        typical_savings: 25000,
        recommended_tier: 'enterprise'
      }
    ];
  }

  async recommendPricingTier(userId: string): Promise<{ tier: PricingTier; reasoning: string }> {
    try {
      const valueCalculation = await this.calculateCustomerValue(userId);
      const tiers = await this.getPricingTiers();
      
      // Find the best tier based on value
      let recommendedTier = tiers[0]; // Default to starter
      let reasoning = 'Based on your current support volume and team size';

      for (const tier of tiers) {
        if (valueCalculation.monthly_savings >= tier.value_threshold) {
          recommendedTier = tier;
          reasoning = `Your estimated monthly savings of $${valueCalculation.monthly_savings} exceeds the $${tier.value_threshold} threshold for this tier`;
        }
      }

      // Adjust based on team size and complexity
      const metrics = await this.getCustomerMetrics(userId);
      if (metrics.team_size > 10 && recommendedTier.id === 'professional') {
        recommendedTier = tiers.find(t => t.id === 'enterprise') || recommendedTier;
        reasoning += '. Upgraded to Enterprise due to large team size';
      }

      return { tier: recommendedTier, reasoning };
    } catch (error) {
      console.error('Error recommending pricing tier:', error);
      const tiers = await this.getPricingTiers();
      return {
        tier: tiers[0],
        reasoning: 'Unable to calculate value - defaulting to Starter tier'
      };
    }
  }

  async trackValueOverTime(userId: string): Promise<any[]> {
    try {
      const { data: valueHistory } = await this.supabase
        .from('value_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12); // Last 12 months

      if (!valueHistory) return [];

      return valueHistory.map((record: { created_at: string; monthly_savings: number; roi_percentage: number }) => ({
        month: new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        monthly_savings: record.monthly_savings,
        roi_percentage: record.roi_percentage,
      }));
    } catch (error) {
      console.error('Error tracking value over time:', error);
      return [];
    }
  }

  async saveValueCalculation(userId: string, calculation: ValueCalculation): Promise<void> {
    try {
      await this.supabase
        .from('value_tracking')
        .insert({
          user_id: userId,
          monthly_savings: calculation.monthly_savings,
          annual_savings: calculation.annual_savings,
          roi_percentage: calculation.roi_percentage,
          payback_period_months: calculation.payback_period_months,
          confidence_score: calculation.confidence_score,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving value calculation:', error);
    }
  }

  async getValueComparison(userId: string): Promise<any> {
    try {
      const userCalculation = await this.calculateCustomerValue(userId);
      const segments = await this.getCustomerSegments();
      
        // Find user's segment based on metrics
        const metrics = await this.getCustomerMetrics(userId);
        const userSegment = segments.find(s => 
          Math.abs(s.avg_tickets_per_month - metrics.avg_tickets_per_month) < 100
        ) || segments[1]; // Default to SME

        return {
          user_savings: userCalculation.monthly_savings,
          segment_avg: userSegment.typical_savings,
          percentile: this.calculatePercentile(userCalculation.monthly_savings, userSegment.typical_savings),
          comparison_text: this.generateComparisonText(userCalculation.monthly_savings, userSegment.typical_savings)
        };
    } catch (error) {
      console.error('Error getting value comparison:', error);
      return null;
    }
  }

  private calculatePercentile(userValue: number, segmentAvg: number): number {
    // Simple percentile calculation
    if (userValue >= segmentAvg * 1.5) return 90;
    if (userValue >= segmentAvg * 1.2) return 75;
    if (userValue >= segmentAvg) return 50;
    if (userValue >= segmentAvg * 0.8) return 25;
    return 10;
  }

  private generateComparisonText(userValue: number, segmentAvg: number): string {
    const ratio = userValue / segmentAvg;
    
    if (ratio >= 1.5) {
      return `Your estimated savings are ${Math.round(ratio * 100)}% higher than similar companies!`;
    } else if (ratio >= 1.2) {
      return `Your estimated savings are ${Math.round((ratio - 1) * 100)}% above average for your segment.`;
    } else if (ratio >= 0.8) {
      return `Your estimated savings are in line with similar companies.`;
    } else {
      return `Your estimated savings are ${Math.round((1 - ratio) * 100)}% below average, indicating room for improvement.`;
    }
  }
} 