'use client';

import { createClient } from '@supabase/supabase-js';

// Real-time results tracking for customer validation
interface CustomerResults {
  userId: string;
  company: string;
  email: string;
  // Core metrics that prove ROI
  metrics: {
    // Ticket deflection
    totalTickets: number;
    deflectedTickets: number;
    deflectionRate: number;
    
    // Time savings
    avgResponseTimeBefore: number; // hours
    avgResponseTimeAfter: number; // hours
    timeSavedHours: number;
    
    // Cost savings
    costPerTicket: number;
    monthlySavings: number;
    totalSavings: number;
    
    // Customer satisfaction
    satisfactionBefore: number; // 1-5
    satisfactionAfter: number; // 1-5
    satisfactionImprovement: number;
    
    // Implementation success
    timeToFirstValue: number; // days
    featureAdoption: {
      aiDeflection: boolean;
      realTimeAnalytics: boolean;
      customWorkflows: boolean;
    };
  };
  
  // Historical data for trends
  dailyMetrics: Array<{
    date: string;
    ticketsProcessed: number;
    ticketsDeflected: number;
    customerSatisfaction: number;
    costSavings: number;
  }>;
  
  // Testimonial data
  feedback: {
    rating: number;
    quote?: string;
    isTestimonial: boolean;
    caseStudyConsent: boolean;
  };
  
  // Tracking metadata
  lastUpdated: string;
  dataPoints: number;
  isActive: boolean;
}

export class ResultsTracker {
  private supabase: any;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Track a new customer result
  async trackCustomerResults(userId: string, metrics: Partial<CustomerResults['metrics']>): Promise<void> {
    try {
      // Get existing results
      const { data: existing } = await this.supabase
        .from('customer_results')
        .select('*')
        .eq('user_id', userId)
        .single();

      const now = new Date().toISOString();
      const today = now.split('T')[0];

      if (existing) {
        // Update existing metrics
        const updatedMetrics = { ...existing.metrics, ...metrics };
        
        // Calculate derived metrics
        updatedMetrics.deflectionRate = updatedMetrics.totalTickets > 0 
          ? (updatedMetrics.deflectedTickets / updatedMetrics.totalTickets) * 100 
          : 0;
        
        updatedMetrics.timeSavedHours = 
          (updatedMetrics.avgResponseTimeBefore - updatedMetrics.avgResponseTimeAfter) * 
          updatedMetrics.deflectedTickets;
        
        updatedMetrics.monthlySavings = 
          updatedMetrics.deflectedTickets * updatedMetrics.costPerTicket;
        
        updatedMetrics.totalSavings = existing.metrics.totalSavings + 
          (metrics.monthlySavings || 0);
        
        updatedMetrics.satisfactionImprovement = 
          updatedMetrics.satisfactionAfter - updatedMetrics.satisfactionBefore;

        // Update daily metrics
        const dailyMetrics = existing.daily_metrics || [];
        const todayIndex = dailyMetrics.findIndex((d: any) => d.date === today);
        
        const todayMetrics = {
          date: today,
          ticketsProcessed: metrics.totalTickets || 0,
          ticketsDeflected: metrics.deflectedTickets || 0,
          customerSatisfaction: metrics.satisfactionAfter || 0,
          costSavings: updatedMetrics.monthlySavings
        };

        if (todayIndex >= 0) {
          dailyMetrics[todayIndex] = todayMetrics;
        } else {
          dailyMetrics.push(todayMetrics);
        }

        // Keep only last 90 days
        dailyMetrics.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const recent = dailyMetrics.slice(0, 90);

        await this.supabase
          .from('customer_results')
          .update({
            metrics: updatedMetrics,
            daily_metrics: recent,
            last_updated: now,
            data_points: existing.data_points + 1
          })
          .eq('user_id', userId);

      } else {
        // Create new customer results
        const { data: user } = await this.supabase
          .from('users')
          .select('email, company')
          .eq('id', userId)
          .single();

        const initialMetrics: CustomerResults['metrics'] = {
          totalTickets: metrics.totalTickets || 0,
          deflectedTickets: metrics.deflectedTickets || 0,
          deflectionRate: 0,
          avgResponseTimeBefore: metrics.avgResponseTimeBefore || 8,
          avgResponseTimeAfter: metrics.avgResponseTimeAfter || 2,
          timeSavedHours: 0,
          costPerTicket: metrics.costPerTicket || 15,
          monthlySavings: 0,
          totalSavings: 0,
          satisfactionBefore: metrics.satisfactionBefore || 3.2,
          satisfactionAfter: metrics.satisfactionAfter || 3.2,
          satisfactionImprovement: 0,
          timeToFirstValue: 0,
          featureAdoption: {
            aiDeflection: false,
            realTimeAnalytics: false,
            customWorkflows: false
          },
          ...metrics
        };

        // Calculate initial derived metrics
        initialMetrics.deflectionRate = initialMetrics.totalTickets > 0 
          ? (initialMetrics.deflectedTickets / initialMetrics.totalTickets) * 100 
          : 0;
        
        initialMetrics.timeSavedHours = 
          (initialMetrics.avgResponseTimeBefore - initialMetrics.avgResponseTimeAfter) * 
          initialMetrics.deflectedTickets;
        
        initialMetrics.monthlySavings = 
          initialMetrics.deflectedTickets * initialMetrics.costPerTicket;
        
        initialMetrics.totalSavings = initialMetrics.monthlySavings;
        
        initialMetrics.satisfactionImprovement = 
          initialMetrics.satisfactionAfter - initialMetrics.satisfactionBefore;

        const newResults: Partial<CustomerResults> = {
          userId,
          company: user?.company || 'Unknown',
          email: user?.email || '',
          metrics: initialMetrics,
          dailyMetrics: [{
            date: today,
            ticketsProcessed: initialMetrics.totalTickets,
            ticketsDeflected: initialMetrics.deflectedTickets,
            customerSatisfaction: initialMetrics.satisfactionAfter,
            costSavings: initialMetrics.monthlySavings
          }],
          feedback: {
            rating: 0,
            isTestimonial: false,
            caseStudyConsent: false
          },
          lastUpdated: now,
          dataPoints: 1,
          isActive: true
        };

        await this.supabase
          .from('customer_results')
          .insert(newResults);
      }

      // Auto-identify testimonial candidates
      await this.identifyTestimonialCandidates();

    } catch (error) {
      console.error('Error tracking customer results:', error);
      throw error;
    }
  }

  // Get all customer results for analytics
  async getAllResults(): Promise<CustomerResults[]> {
    try {
      const { data, error } = await this.supabase
        .from('customer_results')
        .select('*')
        .eq('is_active', true)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting customer results:', error);
      return [];
    }
  }

  // Get aggregate metrics for dashboard
  async getAggregateMetrics(): Promise<{
    totalCustomers: number;
    avgDeflectionRate: number;
    totalSavings: number;
    avgSatisfactionImprovement: number;
    testimonialsReady: number;
    recentGrowth: {
      newCustomers: number;
      totalTicketsProcessed: number;
      totalTicketsDeflected: number;
    };
  }> {
    try {
      const results = await this.getAllResults();
      
      if (results.length === 0) {
        return {
          totalCustomers: 0,
          avgDeflectionRate: 0,
          totalSavings: 0,
          avgSatisfactionImprovement: 0,
          testimonialsReady: 0,
          recentGrowth: {
            newCustomers: 0,
            totalTicketsProcessed: 0,
            totalTicketsDeflected: 0
          }
        };
      }

      const totalSavings = results.reduce((sum, r) => sum + r.metrics.totalSavings, 0);
      const avgDeflectionRate = results.reduce((sum, r) => sum + r.metrics.deflectionRate, 0) / results.length;
      const avgSatisfactionImprovement = results.reduce((sum, r) => sum + r.metrics.satisfactionImprovement, 0) / results.length;
      
      const testimonialsReady = results.filter(r => 
        r.metrics.deflectionRate > 40 && 
        r.metrics.satisfactionImprovement > 0.5 &&
        r.feedback.rating >= 4
      ).length;

      // Recent growth (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const recentCustomers = results.filter(r => 
        new Date(r.lastUpdated) > weekAgo
      ).length;

      const recentTicketsProcessed = results.reduce((sum, r) => {
        const recentDaily = r.dailyMetrics.filter(d => d.date >= weekAgoStr);
        return sum + recentDaily.reduce((daySum, day) => daySum + day.ticketsProcessed, 0);
      }, 0);

      const recentTicketsDeflected = results.reduce((sum, r) => {
        const recentDaily = r.dailyMetrics.filter(d => d.date >= weekAgoStr);
        return sum + recentDaily.reduce((daySum, day) => daySum + day.ticketsDeflected, 0);
      }, 0);

      return {
        totalCustomers: results.length,
        avgDeflectionRate: Math.round(avgDeflectionRate * 10) / 10,
        totalSavings: Math.round(totalSavings),
        avgSatisfactionImprovement: Math.round(avgSatisfactionImprovement * 10) / 10,
        testimonialsReady,
        recentGrowth: {
          newCustomers: recentCustomers,
          totalTicketsProcessed: recentTicketsProcessed,
          totalTicketsDeflected: recentTicketsDeflected
        }
      };
    } catch (error) {
      console.error('Error getting aggregate metrics:', error);
      return {
        totalCustomers: 0,
        avgDeflectionRate: 0,
        totalSavings: 0,
        avgSatisfactionImprovement: 0,
        testimonialsReady: 0,
        recentGrowth: {
          newCustomers: 0,
          totalTicketsProcessed: 0,
          totalTicketsDeflected: 0
        }
      };
    }
  }

  // Identify customers ready for testimonials
  async identifyTestimonialCandidates(): Promise<CustomerResults[]> {
    try {
      const results = await this.getAllResults();
      
      return results.filter(customer => 
        customer.metrics.deflectionRate > 40 &&
        customer.metrics.totalSavings > 500 &&
        customer.metrics.satisfactionImprovement > 0.5 &&
        customer.dataPoints > 10 &&
        !customer.feedback.isTestimonial
      ).sort((a, b) => b.metrics.totalSavings - a.metrics.totalSavings);
      
    } catch (error) {
      console.error('Error identifying testimonial candidates:', error);
      return [];
    }
  }

  // Update customer feedback
  async updateCustomerFeedback(userId: string, feedback: Partial<CustomerResults['feedback']>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('customer_results')
        .update({ 
          feedback,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating customer feedback:', error);
      throw error;
    }
  }

  // Get top performing customers for case studies
  async getTopPerformers(limit: number = 5): Promise<CustomerResults[]> {
    try {
      const results = await this.getAllResults();
      
      return results
        .filter(r => r.metrics.totalSavings > 100) // Minimum savings threshold
        .sort((a, b) => {
          // Score based on multiple factors
          const scoreA = (a.metrics.deflectionRate * 0.4) + 
                        (a.metrics.totalSavings * 0.001) + 
                        (a.metrics.satisfactionImprovement * 20) +
                        (a.dataPoints * 0.1);
          const scoreB = (b.metrics.deflectionRate * 0.4) + 
                        (b.metrics.totalSavings * 0.001) + 
                        (b.metrics.satisfactionImprovement * 20) +
                        (b.dataPoints * 0.1);
          return scoreB - scoreA;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top performers:', error);
      return [];
    }
  }

  // Generate success story for marketing
  async generateSuccessStory(userId: string): Promise<string> {
    try {
      const { data: customer } = await this.supabase
        .from('customer_results')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!customer) throw new Error('Customer not found');

      const metrics = customer.metrics;
      const timeframe = customer.data_points > 30 ? 'month' : 'weeks';
      
      return `${customer.company} transformed their customer support with SupportIQ:

🎯 Results in first ${timeframe}:
• ${metrics.deflectionRate.toFixed(1)}% ticket deflection rate
• $${metrics.totalSavings.toLocaleString()} in cost savings
• ${metrics.satisfactionImprovement > 0 ? '+' : ''}${metrics.satisfactionImprovement.toFixed(1)} point satisfaction improvement
• ${metrics.timeSavedHours.toFixed(0)} hours saved per month

"${customer.feedback.quote || 'SupportIQ helped us scale our support without scaling our team.'}"

- ${customer.company}`;

    } catch (error) {
      console.error('Error generating success story:', error);
      return '';
    }
  }
}

// Lazy singleton instance to avoid build-time errors
let resultsTrackerInstance: ResultsTracker | null = null;

export const resultsTracker = {
  get instance(): ResultsTracker {
    if (!resultsTrackerInstance) {
      resultsTrackerInstance = new ResultsTracker();
    }
    return resultsTrackerInstance;
  }
};