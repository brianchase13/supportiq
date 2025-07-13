import { createClient } from '@supabase/supabase-js';

interface TrackingMetrics {
  user_id: string;
  date: string;
  tickets_processed: number;
  tickets_deflected: number;
  deflection_rate: number;
  avg_response_time_hours: number;
  customer_satisfaction_score: number;
  agent_efficiency_score: number;
  cost_savings: number;
  roi_percentage: number;
  total_agent_hours_saved: number;
  customer_retention_rate: number;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  test_type: 'response_template' | 'deflection_threshold' | 'automation_rules';
  variants: ABTestVariant[];
  status: 'draft' | 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  sample_size: number;
  confidence_level: number;
  winner?: string;
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  configuration: any;
  traffic_percentage: number;
  metrics: ABTestMetrics;
}

interface ABTestMetrics {
  impressions: number;
  conversions: number;
  conversion_rate: number;
  avg_response_time: number;
  satisfaction_score: number;
  deflection_rate: number;
  cost_savings: number;
}

interface CustomerFeedback {
  id: string;
  user_id: string;
  ticket_id: string;
  satisfaction_score: number;
  response_helpful: boolean;
  would_recommend: boolean;
  feedback_text?: string;
  category: string;
  created_at: string;
}

interface DeflectionEvent {
  id: string;
  user_id: string;
  ticket_id: string;
  deflection_type: 'auto_response' | 'faq_match' | 'template_match';
  confidence_score: number;
  response_template_used?: string;
  customer_feedback?: CustomerFeedback;
  created_at: string;
}

export class ResultsTrackingSystem {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async trackDailyMetrics(userId: string, date: string): Promise<TrackingMetrics> {
    try {
      // Get tickets for the day
      const { data: tickets } = await this.supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      // Get deflection events for the day
      const { data: deflections } = await this.supabase
        .from('deflection_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      // Get customer feedback for the day
      const { data: feedback } = await this.supabase
        .from('customer_feedback')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      // Calculate metrics
      const ticketsProcessed = tickets?.length || 0;
      const ticketsDeflected = deflections?.length || 0;
      const deflectionRate = ticketsProcessed > 0 ? (ticketsDeflected / ticketsProcessed) * 100 : 0;

      // Calculate average response time
      const responseTimes = tickets
        ?.filter(t => t.resolution_time_hours)
        .map(t => t.resolution_time_hours) || [];
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;

      // Calculate customer satisfaction
      const satisfactionScores = feedback?.map(f => f.satisfaction_score) || [];
      const avgSatisfaction = satisfactionScores.length > 0
        ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
        : 0;

      // Calculate cost savings
      const costSavings = ticketsDeflected * 25; // $25 per ticket

      // Calculate ROI
      const monthlyCost = 99;
      const roiPercentage = monthlyCost > 0 ? ((costSavings - monthlyCost) / monthlyCost) * 100 : 0;

      // Calculate agent efficiency (simplified)
      const agentEfficiency = Math.min(100, deflectionRate + (avgSatisfaction * 10));

      const metrics: TrackingMetrics = {
        user_id: userId,
        date,
        tickets_processed: ticketsProcessed,
        tickets_deflected: ticketsDeflected,
        deflection_rate: deflectionRate,
        avg_response_time_hours: avgResponseTime,
        customer_satisfaction_score: avgSatisfaction,
        agent_efficiency_score: agentEfficiency,
        cost_savings: costSavings,
        roi_percentage: roiPercentage,
        total_agent_hours_saved: ticketsDeflected * 0.1, // 0.1 hours per ticket
        customer_retention_rate: this.calculateRetentionRate(feedback)
      };

      // Store metrics
      await this.storeDailyMetrics(metrics);

      return metrics;
    } catch (error) {
      console.error('Error tracking daily metrics:', error);
      throw error;
    }
  }

  private calculateRetentionRate(feedback: CustomerFeedback[]): number {
    if (!feedback || feedback.length === 0) return 0;
    
    const wouldRecommend = feedback.filter(f => f.would_recommend).length;
    return (wouldRecommend / feedback.length) * 100;
  }

  private async storeDailyMetrics(metrics: TrackingMetrics): Promise<void> {
    try {
      await this.supabase
        .from('daily_metrics')
        .upsert(metrics, {
          onConflict: 'user_id,date'
        });
    } catch (error) {
      console.error('Error storing daily metrics:', error);
    }
  }

  async createABTest(test: Omit<ABTest, 'id' | 'winner'>): Promise<ABTest> {
    try {
      const newTest: ABTest = {
        ...test,
        id: `abtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const { data, error } = await this.supabase
        .from('ab_tests')
        .insert(newTest)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      throw error;
    }
  }

  async recordABTestImpression(testId: string, variantId: string, ticketId: string): Promise<void> {
    try {
      await this.supabase
        .from('ab_test_impressions')
        .insert({
          test_id: testId,
          variant_id: variantId,
          ticket_id: ticketId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording A/B test impression:', error);
    }
  }

  async recordABTestConversion(testId: string, variantId: string, ticketId: string, conversionType: string): Promise<void> {
    try {
      await this.supabase
        .from('ab_test_conversions')
        .insert({
          test_id: testId,
          variant_id: variantId,
          ticket_id: ticketId,
          conversion_type: conversionType,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording A/B test conversion:', error);
    }
  }

  async getABTestResults(testId: string): Promise<ABTestVariant[]> {
    try {
      const { data: test } = await this.supabase
        .from('ab_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (!test) throw new Error('Test not found');

      // Get impressions and conversions for each variant
      const variants = await Promise.all(
        test.variants.map(async (variant: ABTestVariant) => {
          const { data: impressions } = await this.supabase
            .from('ab_test_impressions')
            .select('*')
            .eq('test_id', testId)
            .eq('variant_id', variant.id);

          const { data: conversions } = await this.supabase
            .from('ab_test_conversions')
            .select('*')
            .eq('test_id', testId)
            .eq('variant_id', variant.id);

          const impressionCount = impressions?.length || 0;
          const conversionCount = conversions?.length || 0;
          const conversionRate = impressionCount > 0 ? (conversionCount / impressionCount) * 100 : 0;

          return {
            ...variant,
            metrics: {
              impressions: impressionCount,
              conversions: conversionCount,
              conversion_rate: conversionRate,
              avg_response_time: 2.3, // Mock data
              satisfaction_score: 4.2, // Mock data
              deflection_rate: conversionRate,
              cost_savings: conversionCount * 25
            }
          };
        })
      );

      return variants;
    } catch (error) {
      console.error('Error getting A/B test results:', error);
      return [];
    }
  }

  async determineABTestWinner(testId: string): Promise<string | null> {
    try {
      const variants = await this.getABTestResults(testId);
      
      if (variants.length < 2) return null;

      // Simple winner determination based on conversion rate
      let winner = variants[0];
      let maxConversionRate = variants[0].metrics.conversion_rate;

      for (const variant of variants.slice(1)) {
        if (variant.metrics.conversion_rate > maxConversionRate) {
          winner = variant;
          maxConversionRate = variant.metrics.conversion_rate;
        }
      }

      // Check if the difference is statistically significant
      const isSignificant = this.calculateStatisticalSignificance(variants);
      
      if (isSignificant) {
        // Update test with winner
        await this.supabase
          .from('ab_tests')
          .update({
            winner: winner.id,
            status: 'completed',
            end_date: new Date().toISOString()
          })
          .eq('id', testId);

        return winner.id;
      }

      return null;
    } catch (error) {
      console.error('Error determining A/B test winner:', error);
      return null;
    }
  }

  private calculateStatisticalSignificance(variants: ABTestVariant[]): boolean {
    // Simplified statistical significance calculation
    // In a real implementation, you'd use proper statistical tests
    const conversionRates = variants.map(v => v.metrics.conversion_rate);
    const maxRate = Math.max(...conversionRates);
    const minRate = Math.min(...conversionRates);
    
    // Consider significant if difference is more than 5%
    return (maxRate - minRate) > 5;
  }

  async recordCustomerFeedback(feedback: Omit<CustomerFeedback, 'id' | 'created_at'>): Promise<CustomerFeedback> {
    try {
      const newFeedback: CustomerFeedback = {
        ...feedback,
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('customer_feedback')
        .insert(newFeedback)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording customer feedback:', error);
      throw error;
    }
  }

  async recordDeflectionEvent(event: Omit<DeflectionEvent, 'id' | 'created_at'>): Promise<DeflectionEvent> {
    try {
      const newEvent: DeflectionEvent = {
        ...event,
        id: `deflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('deflection_events')
        .insert(newEvent)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording deflection event:', error);
      throw error;
    }
  }

  async getResultsSummary(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: metrics } = await this.supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (!metrics || metrics.length === 0) return null;

      // Calculate summary statistics
      const totalTickets = metrics.reduce((sum, m) => sum + m.tickets_processed, 0);
      const totalDeflected = metrics.reduce((sum, m) => sum + m.tickets_deflected, 0);
      const avgDeflectionRate = totalTickets > 0 ? (totalDeflected / totalTickets) * 100 : 0;
      const avgResponseTime = metrics.reduce((sum, m) => sum + m.avg_response_time_hours, 0) / metrics.length;
      const avgSatisfaction = metrics.reduce((sum, m) => sum + m.customer_satisfaction_score, 0) / metrics.length;
      const totalSavings = metrics.reduce((sum, m) => sum + m.cost_savings, 0);
      const avgROI = metrics.reduce((sum, m) => sum + m.roi_percentage, 0) / metrics.length;

      // Calculate trends
      const recentMetrics = metrics.slice(-7); // Last 7 days
      const olderMetrics = metrics.slice(0, -7); // Previous 7 days

      const recentAvgDeflection = recentMetrics.reduce((sum, m) => sum + m.deflection_rate, 0) / recentMetrics.length;
      const olderAvgDeflection = olderMetrics.reduce((sum, m) => sum + m.deflection_rate, 0) / olderMetrics.length;
      const deflectionTrend = recentAvgDeflection - olderAvgDeflection;

      return {
        summary: {
          total_tickets: totalTickets,
          total_deflected: totalDeflected,
          avg_deflection_rate: avgDeflectionRate,
          avg_response_time: avgResponseTime,
          avg_satisfaction: avgSatisfaction,
          total_savings: totalSavings,
          avg_roi: avgROI
        },
        trends: {
          deflection_trend: deflectionTrend,
          improving: deflectionTrend > 0
        },
        daily_breakdown: metrics.map(m => ({
          date: m.date,
          tickets: m.tickets_processed,
          deflected: m.tickets_deflected,
          deflection_rate: m.deflection_rate,
          savings: m.cost_savings
        }))
      };
    } catch (error) {
      console.error('Error getting results summary:', error);
      return null;
    }
  }

  async generatePerformanceReport(userId: string): Promise<any> {
    try {
      const summary = await this.getResultsSummary(userId, 30);
      const { data: feedback } = await this.supabase
        .from('customer_feedback')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: deflections } = await this.supabase
        .from('deflection_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!summary) return null;

      // Analyze feedback patterns
      const feedbackAnalysis = this.analyzeFeedback(feedback || []);
      
      // Analyze deflection patterns
      const deflectionAnalysis = this.analyzeDeflections(deflections || []);

      return {
        performance_summary: summary,
        feedback_analysis: feedbackAnalysis,
        deflection_analysis: deflectionAnalysis,
        recommendations: this.generateRecommendations(summary, feedbackAnalysis, deflectionAnalysis)
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      return null;
    }
  }

  private analyzeFeedback(feedback: CustomerFeedback[]): any {
    if (feedback.length === 0) return null;

    const satisfactionScores = feedback.map(f => f.satisfaction_score);
    const helpfulResponses = feedback.filter(f => f.response_helpful).length;
    const wouldRecommend = feedback.filter(f => f.would_recommend).length;

    // Categorize feedback
    const categories = feedback.reduce((acc: any, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total_feedback: feedback.length,
      avg_satisfaction: satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length,
      helpful_rate: (helpfulResponses / feedback.length) * 100,
      recommendation_rate: (wouldRecommend / feedback.length) * 100,
      category_breakdown: categories,
      common_issues: this.extractCommonIssues(feedback)
    };
  }

  private analyzeDeflections(deflections: DeflectionEvent[]): any {
    if (deflections.length === 0) return null;

    const deflectionTypes = deflections.reduce((acc: any, d) => {
      acc[d.deflection_type] = (acc[d.deflection_type] || 0) + 1;
      return acc;
    }, {});

    const avgConfidence = deflections.reduce((sum, d) => sum + d.confidence_score, 0) / deflections.length;

    return {
      total_deflections: deflections.length,
      deflection_types: deflectionTypes,
      avg_confidence: avgConfidence,
      top_templates: this.getTopTemplates(deflections)
    };
  }

  private extractCommonIssues(feedback: CustomerFeedback[]): string[] {
    // Simple keyword extraction from feedback text
    const allText = feedback
      .filter(f => f.feedback_text)
      .map(f => f.feedback_text!.toLowerCase())
      .join(' ');

    const commonWords = allText
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4);

    const wordCounts: { [key: string]: number } = {};
    commonWords.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    return Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private getTopTemplates(deflections: DeflectionEvent[]): { template: string; count: number }[] {
    const templateCounts: { [key: string]: number } = {};
    
    deflections.forEach(d => {
      if (d.response_template_used) {
        templateCounts[d.response_template_used] = (templateCounts[d.response_template_used] || 0) + 1;
      }
    });

    return Object.entries(templateCounts)
      .map(([template, count]) => ({ template, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private generateRecommendations(summary: any, feedbackAnalysis: any, deflectionAnalysis: any): string[] {
    const recommendations: string[] = [];

    if (summary.summary.avg_deflection_rate < 50) {
      recommendations.push('Increase deflection rate by optimizing response templates and FAQ matching');
    }

    if (summary.summary.avg_satisfaction < 4.0) {
      recommendations.push('Improve customer satisfaction by refining auto-responses and escalation rules');
    }

    if (summary.summary.avg_response_time > 4) {
      recommendations.push('Reduce response times by improving ticket routing and automation rules');
    }

    if (feedbackAnalysis && feedbackAnalysis.helpful_rate < 80) {
      recommendations.push('Enhance response quality by updating templates and improving AI training');
    }

    return recommendations;
  }
} 