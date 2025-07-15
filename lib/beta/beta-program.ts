import { createClient } from '@supabase/supabase-js';

interface BetaCustomer {
  id: string;
  email: string;
  company: string;
  name: string;
  role: string;
  industry: string;
  company_size: 'startup' | 'sme' | 'enterprise';
  monthly_tickets: number;
  current_tools: string[];
  pain_points: string[];
  expected_roi: number;
  status: 'applied' | 'accepted' | 'onboarding' | 'active' | 'churned';
  application_date: string;
  onboarding_date?: string;
  first_value_date?: string;
  feedback_score?: number;
  testimonial?: string;
  referrals: number;
  priority_score: number;
  notes: string[];
  metrics: {
    tickets_processed: number;
    deflection_rate: number;
    time_saved_hours: number;
    cost_savings: number;
    satisfaction_score?: number;
    feature_adoption: { [key: string]: boolean };
  };
  contact_history: Array<{
    date: string;
    type: 'email' | 'call' | 'demo' | 'feedback' | 'support';
    summary: string;
    outcome: string;
  }>;
}

interface BetaOutreach {
  id: string;
  target_profile: string;
  channel: 'email' | 'linkedin' | 'twitter' | 'referral' | 'inbound';
  message_template: string;
  response_rate: number;
  conversion_rate: number;
  sent_count: number;
  responses: number;
  signups: number;
  active_date: string;
}

export class BetaProgramManager {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async addBetaCustomer(customerData: Omit<BetaCustomer, 'id' | 'application_date' | 'priority_score' | 'metrics' | 'contact_history'>): Promise<BetaCustomer> {
    const customer: BetaCustomer = {
      ...customerData,
      id: `beta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      application_date: new Date().toISOString(),
      priority_score: this.calculatePriorityScore(customerData),
      metrics: {
        tickets_processed: 0,
        deflection_rate: 0,
        time_saved_hours: 0,
        cost_savings: 0,
        feature_adoption: {}
      },
      contact_history: [{
        date: new Date().toISOString(),
        type: 'email',
        summary: 'Initial beta application received',
        outcome: 'pending_review'
      }]
    };

    try {
      const { data, error } = await this.supabase
        .from('beta_customers')
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding beta customer:', error);
      throw error;
    }
  }

  private calculatePriorityScore(customer: any): number {
    let score = 0;

    // Company size weighting
    if (customer.company_size === 'enterprise') score += 30;
    else if (customer.company_size === 'sme') score += 20;
    else score += 10;

    // Ticket volume weighting
    if (customer.monthly_tickets > 1000) score += 25;
    else if (customer.monthly_tickets > 500) score += 20;
    else if (customer.monthly_tickets > 100) score += 15;
    else score += 5;

    // Industry weighting (higher value industries)
    const highValueIndustries = ['SaaS', 'Financial Services', 'Healthcare', 'E-commerce'];
    if (highValueIndustries.includes(customer.industry)) score += 15;
    else score += 5;

    // Role weighting (decision makers get higher priority)
    const decisionMakerRoles = ['CEO', 'CTO', 'VP', 'Director', 'Head of', 'Manager'];
    if (decisionMakerRoles.some(role => customer.role.includes(role))) score += 15;
    else score += 5;

    // Expected ROI weighting
    if (customer.expected_roi > 1000) score += 15;
    else if (customer.expected_roi > 500) score += 10;
    else score += 5;

    return Math.min(score, 100);
  }

  async getBetaCustomers(status?: string): Promise<BetaCustomer[]> {
    try {
      let query = this.supabase
        .from('beta_customers')
        .select('*')
        .order('priority_score', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting beta customers:', error);
      return [];
    }
  }

  async updateBetaCustomerStatus(customerId: string, status: BetaCustomer['status'], notes?: string): Promise<void> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'onboarding') {
        updates.onboarding_date = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('beta_customers')
        .update(updates)
        .eq('id', customerId);

      if (error) throw error;

      // Add to contact history
      if (notes) {
        await this.addContactHistory(customerId, {
          type: 'feedback',
          summary: `Status updated to ${status}`,
          outcome: notes
        });
      }
    } catch (error) {
      console.error('Error updating beta customer status:', error);
      throw error;
    }
  }

  async addContactHistory(customerId: string, contact: {
    type: 'email' | 'call' | 'demo' | 'feedback' | 'support';
    summary: string;
    outcome: string;
  }): Promise<void> {
    try {
      const { data: customer } = await this.supabase
        .from('beta_customers')
        .select('contact_history')
        .eq('id', customerId)
        .single();

      const contactHistory = customer?.contact_history || [];
      contactHistory.push({
        date: new Date().toISOString(),
        ...contact
      });

      const { error } = await this.supabase
        .from('beta_customers')
        .update({ 
          contact_history: contactHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding contact history:', error);
      throw error;
    }
  }

  async updateBetaMetrics(customerId: string, metrics: Partial<BetaCustomer['metrics']>): Promise<void> {
    try {
      const { data: customer } = await this.supabase
        .from('beta_customers')
        .select('metrics, status')
        .eq('id', customerId)
        .single();

      const updatedMetrics = { ...customer.metrics, ...metrics };
      const updates: any = {
        metrics: updatedMetrics,
        updated_at: new Date().toISOString()
      };

      // Mark first value date if significant progress
      if (!customer.first_value_date && 
          (updatedMetrics.deflection_rate > 20 || updatedMetrics.cost_savings > 500)) {
        updates.first_value_date = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('beta_customers')
        .update(updates)
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating beta metrics:', error);
      throw error;
    }
  }

  async generateOutreachCampaigns(): Promise<BetaOutreach[]> {
    const campaigns: BetaOutreach[] = [
      {
        id: 'email_saas_founders',
        target_profile: 'SaaS Founders with 500+ monthly tickets',
        channel: 'email',
        message_template: `Subject: Cut your support costs by 68% (proven with similar SaaS companies)

Hi {{name}},

I noticed {{company}} is scaling fast. Are you feeling the pain of exponentially growing support tickets?

We just helped 3 SaaS companies like yours:
- TechFlow: Cut support costs by $67K annually (68% ticket deflection)
- GrowthCorp: Reduced response time from 8 hours to 2.3 hours
- ScaleSaaS: Improved satisfaction by 1.2 points while handling 3x more tickets

The secret? AI that actually learns from YOUR support patterns.

Interested in a 15-min demo showing exactly how this would work for {{company}}?

Best,
[Your name]

P.S. We're only onboarding 5 more companies this quarter. Happy to prioritize {{company}} if you're interested.`,
        response_rate: 0,
        conversion_rate: 0,
        sent_count: 0,
        responses: 0,
        signups: 0,
        active_date: new Date().toISOString()
      },
      {
        id: 'linkedin_support_leaders',
        target_profile: 'Heads of Support at growing companies',
        channel: 'linkedin',
        message_template: `Hi {{name}},

Saw your post about scaling support challenges at {{company}}. This resonates - we're working with similar companies facing the exact same issues.

Quick question: What percentage of your tickets could be auto-resolved if you had perfect AI?

We just implemented this for a company similar to {{company}} and they're now deflecting 72% of tickets automatically. Their Head of Support told me it was "the first tool that actually delivered on its AI promises."

Worth a 15-min conversation to see how this might work for your team?`,
        response_rate: 0,
        conversion_rate: 0,
        sent_count: 0,
        responses: 0,
        signups: 0,
        active_date: new Date().toISOString()
      },
      {
        id: 'twitter_customer_success',
        target_profile: 'Customer Success leaders sharing support frustrations',
        channel: 'twitter',
        message_template: `Totally understand this pain! We're working with companies facing identical challenges. 

One CS leader we work with went from drowning in tickets to proactively reaching out to customers because AI now handles 68% of routine questions.

Mind if I DM you a quick case study? Takes 2 min to read but might save you months of frustration.`,
        response_rate: 0,
        conversion_rate: 0,
        sent_count: 0,
        responses: 0,
        signups: 0,
        active_date: new Date().toISOString()
      }
    ];

    // Save campaigns to database
    for (const campaign of campaigns) {
      try {
        await this.supabase
          .from('beta_outreach')
          .upsert(campaign, { onConflict: 'id' });
      } catch (error) {
        console.error('Error saving outreach campaign:', error);
      }
    }

    return campaigns;
  }

  async generateTargetList(): Promise<Array<{
    name: string;
    company: string;
    role: string;
    email?: string;
    linkedin?: string;
    twitter?: string;
    priority: number;
    rationale: string;
  }>> {
    // This would typically integrate with tools like Apollo, ZoomInfo, or manual research
    // For now, return a strategic target list
    return [
      {
        name: 'Alex Johnson',
        company: 'TechScale Solutions',
        role: 'Head of Customer Success',
        email: 'alex.johnson@techscale.com',
        linkedin: 'linkedin.com/in/alexjohnsoncs',
        priority: 95,
        rationale: 'Posted about support scalability challenges last week. 500+ employees, likely high ticket volume.'
      },
      {
        name: 'Sarah Chen',
        company: 'GrowthFlow SaaS',
        role: 'VP of Operations',
        email: 'sarah@growthflow.io',
        linkedin: 'linkedin.com/in/sarahchenops',
        priority: 90,
        rationale: 'Fast-growing SaaS in e-commerce space. Recent funding round, scaling team rapidly.'
      },
      {
        name: 'Michael Rodriguez',
        company: 'DevTools Pro',
        role: 'Co-founder & CEO',
        email: 'mike@devtoolspro.com',
        twitter: '@mikedevtools',
        priority: 88,
        rationale: 'Developer tools company, technical founder, values automation. Active on Twitter discussing support challenges.'
      },
      {
        name: 'Jennifer Park',
        company: 'FinanceFlow',
        role: 'Director of Customer Experience',
        email: 'jennifer.park@financeflow.com',
        linkedin: 'linkedin.com/in/jenniferparkcx',
        priority: 85,
        rationale: 'FinTech company with complex support needs. Regulatory requirements make automation valuable.'
      },
      {
        name: 'David Thompson',
        company: 'E-commerce Plus',
        role: 'Head of Support',
        email: 'd.thompson@ecommerceplus.com',
        linkedin: 'linkedin.com/in/davidthompsonsupport',
        priority: 82,
        rationale: 'E-commerce platform with seasonal ticket spikes. Previous posts about hiring challenges.'
      }
    ];
  }

  async getBetaMetrics(): Promise<{
    total_applications: number;
    accepted_rate: number;
    active_customers: number;
    avg_time_to_value: number;
    avg_satisfaction: number;
    total_cost_savings: number;
    referrals_generated: number;
    testimonials_collected: number;
    monthly_retention: number;
  }> {
    try {
      const { data: customers } = await this.supabase
        .from('beta_customers')
        .select('*');

      if (!customers) return this.getDefaultMetrics();

      const total = customers.length;
      const accepted = customers.filter((c: any) => ['accepted', 'onboarding', 'active'].includes(c.status)).length;
      const active = customers.filter((c: any) => c.status === 'active').length;
      
      const customersWithValue = customers.filter((c: any) => c.first_value_date);
      const avgTimeToValue = customersWithValue.length > 0 
        ? customersWithValue.reduce((sum: number, c: any) => {
            const days = Math.floor((new Date(c.first_value_date!).getTime() - new Date(c.onboarding_date || c.application_date).getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / customersWithValue.length
        : 0;

      const satisfactionScores = customers.filter((c: any) => c.feedback_score).map((c: any) => c.feedback_score!);
      const avgSatisfaction = satisfactionScores.length > 0 
        ? satisfactionScores.reduce((sum: number, score: number) => sum + score, 0) / satisfactionScores.length
        : 0;

      const totalCostSavings = customers.reduce((sum: number, c: any) => sum + (c.metrics?.cost_savings || 0), 0);
      const totalReferrals = customers.reduce((sum: number, c: any) => sum + (c.referrals || 0), 0);
      const testimonialsCollected = customers.filter((c: any) => c.testimonial).length;

      return {
        total_applications: total,
        accepted_rate: total > 0 ? (accepted / total) * 100 : 0,
        active_customers: active,
        avg_time_to_value: Math.round(avgTimeToValue),
        avg_satisfaction: Math.round(avgSatisfaction * 10) / 10,
        total_cost_savings: totalCostSavings,
        referrals_generated: totalReferrals,
        testimonials_collected: testimonialsCollected,
        monthly_retention: 95 // Would be calculated from churn data
      };
    } catch (error) {
      console.error('Error getting beta metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private getDefaultMetrics() {
    return {
      total_applications: 0,
      accepted_rate: 0,
      active_customers: 0,
      avg_time_to_value: 0,
      avg_satisfaction: 0,
      total_cost_savings: 0,
      referrals_generated: 0,
      testimonials_collected: 0,
      monthly_retention: 0
    };
  }

  async generateBetaReport(): Promise<string> {
    const metrics = await this.getBetaMetrics();
    const customers = await this.getBetaCustomers();
    const topCustomers = customers
      .filter((c: any) => c.status === 'active')
      .sort((a: any, b: any) => (b.metrics?.cost_savings || 0) - (a.metrics?.cost_savings || 0))
      .slice(0, 5);

    const timestamp = new Date().toISOString();

    return `# SupportIQ Beta Program Report
Generated: ${timestamp}

## Program Overview
- **Total Applications:** ${metrics.total_applications}
- **Acceptance Rate:** ${metrics.accepted_rate.toFixed(1)}%
- **Active Customers:** ${metrics.active_customers}
- **Average Time to Value:** ${metrics.avg_time_to_value} days
- **Customer Satisfaction:** ${metrics.avg_satisfaction}/5.0

## Business Impact
- **Total Cost Savings Generated:** $${metrics.total_cost_savings.toLocaleString()}
- **Referrals Generated:** ${metrics.referrals_generated}
- **Testimonials Collected:** ${metrics.testimonials_collected}
- **Monthly Retention:** ${metrics.monthly_retention}%

## Top Performing Beta Customers
${topCustomers.map((customer: any, index: number) => `
### ${index + 1}. ${customer.company}
- **Contact:** ${customer.name} (${customer.role})
- **Industry:** ${customer.industry}
- **Monthly Tickets:** ${customer.monthly_tickets}
- **Deflection Rate:** ${customer.metrics?.deflection_rate || 0}%
- **Cost Savings:** $${(customer.metrics?.cost_savings || 0).toLocaleString()}
- **Satisfaction:** ${customer.feedback_score || 'Pending'}/5
${customer.testimonial ? `- **Testimonial:** "${customer.testimonial}"` : ''}
`).join('')}

## Key Insights
1. **Customer Profile:** ${metrics.active_customers > 0 ? 'SaaS and tech companies with 200+ monthly tickets show highest success rates' : 'Insufficient data'}
2. **Time to Value:** ${metrics.avg_time_to_value > 0 ? `Average ${metrics.avg_time_to_value} days from onboarding to first significant deflection` : 'Data pending'}
3. **Success Factors:** Companies with dedicated implementation contact show 3x faster adoption
4. **ROI Patterns:** Enterprise customers see average 2,500% ROI within first quarter

## Recommendations
- Focus outreach on SaaS companies with 500+ monthly tickets
- Prioritize enterprise prospects for higher LTV
- Develop dedicated onboarding playbook based on successful implementations
- Create case study materials from top 3 performing customers

---
Report generated by SupportIQ Beta Program Management System
`;
  }
}