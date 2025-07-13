import { createClient } from '@supabase/supabase-js';

interface BetaCustomer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry: string;
  team_size: number;
  monthly_tickets: number;
  current_tools: string[];
  pain_points: string[];
  status: 'prospect' | 'contacted' | 'qualified' | 'onboarded' | 'active' | 'churned';
  priority_score: number;
  created_at: string;
  updated_at: string;
  notes: string[];
  feedback_sessions: FeedbackSession[];
}

interface FeedbackSession {
  id: string;
  customer_id: string;
  session_date: string;
  feedback_type: 'onboarding' | 'weekly' | 'monthly' | 'exit';
  satisfaction_score: number;
  feature_requests: string[];
  pain_points: string[];
  suggestions: string[];
  would_recommend: boolean;
  notes: string;
}

interface BetaProgram {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  requirements: string[];
  duration_weeks: number;
  discount_percentage: number;
  max_customers: number;
  current_customers: number;
  status: 'recruiting' | 'active' | 'completed';
  start_date: string;
  end_date: string;
}

interface RecruitmentCampaign {
  id: string;
  name: string;
  target_audience: string;
  channels: string[];
  message: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  responses: number;
  qualified_leads: number;
}

export class BetaRecruitmentSystem {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async createBetaProgram(program: Omit<BetaProgram, 'id' | 'current_customers'>): Promise<BetaProgram> {
    try {
      const newProgram: BetaProgram = {
        ...program,
        id: `beta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        current_customers: 0
      };

      const { data, error } = await this.supabase
        .from('beta_programs')
        .insert(newProgram)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating beta program:', error);
      throw error;
    }
  }

  async addBetaCustomer(customer: Omit<BetaCustomer, 'id' | 'created_at' | 'updated_at' | 'notes' | 'feedback_sessions'>): Promise<BetaCustomer> {
    try {
      const newCustomer: BetaCustomer = {
        ...customer,
        id: `beta_customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: [],
        feedback_sessions: []
      };

      const { data, error } = await this.supabase
        .from('beta_customers')
        .insert(newCustomer)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding beta customer:', error);
      throw error;
    }
  }

  async updateBetaCustomerStatus(customerId: string, status: BetaCustomer['status'], notes?: string): Promise<void> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updates.notes = this.supabase.sql`array_append(notes, ${notes})`;
      }

      const { error } = await this.supabase
        .from('beta_customers')
        .update(updates)
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating beta customer status:', error);
      throw error;
    }
  }

  async calculatePriorityScore(customer: BetaCustomer): Promise<number> {
    let score = 0;

    // Team size factor (larger teams = higher priority)
    score += Math.min(customer.team_size * 2, 20);

    // Ticket volume factor (higher volume = higher priority)
    score += Math.min(customer.monthly_tickets / 10, 30);

    // Industry factor (tech companies get bonus)
    const techIndustries = ['technology', 'software', 'saas', 'fintech', 'healthtech'];
    if (techIndustries.some(industry => customer.industry.toLowerCase().includes(industry))) {
      score += 15;
    }

    // Pain points factor (more pain points = higher priority)
    score += customer.pain_points.length * 5;

    // Current tools factor (using competitors = higher priority)
    const competitorTools = ['zendesk', 'intercom', 'freshdesk', 'helpscout'];
    const competitorCount = customer.current_tools.filter(tool => 
      competitorTools.some(competitor => tool.toLowerCase().includes(competitor))
    ).length;
    score += competitorCount * 10;

    return Math.min(score, 100);
  }

  async getTopBetaProspects(limit: number = 10): Promise<BetaCustomer[]> {
    try {
      const { data: customers, error } = await this.supabase
        .from('beta_customers')
        .select('*')
        .eq('status', 'prospect')
        .order('priority_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return customers || [];
    } catch (error) {
      console.error('Error getting top beta prospects:', error);
      return [];
    }
  }

  async createRecruitmentCampaign(campaign: Omit<RecruitmentCampaign, 'id' | 'created_at' | 'responses' | 'qualified_leads'>): Promise<RecruitmentCampaign> {
    try {
      const newCampaign: RecruitmentCampaign = {
        ...campaign,
        id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        responses: 0,
        qualified_leads: 0
      };

      const { data, error } = await this.supabase
        .from('recruitment_campaigns')
        .insert(newCampaign)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating recruitment campaign:', error);
      throw error;
    }
  }

  async sendBetaInvitation(customerId: string, invitationType: 'email' | 'linkedin' | 'phone'): Promise<void> {
    try {
      const { data: customer } = await this.supabase
        .from('beta_customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (!customer) throw new Error('Customer not found');

      const invitation = {
        id: `invitation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customer_id: customerId,
        type: invitationType,
        status: 'sent',
        sent_at: new Date().toISOString(),
        message: this.generateInvitationMessage(customer, invitationType)
      };

      await this.supabase
        .from('beta_invitations')
        .insert(invitation);

      // Update customer status
      await this.updateBetaCustomerStatus(customerId, 'contacted');

      // Send actual invitation (email, LinkedIn message, etc.)
      await this.sendActualInvitation(customer, invitation);
    } catch (error) {
      console.error('Error sending beta invitation:', error);
      throw error;
    }
  }

  private generateInvitationMessage(customer: BetaCustomer, type: string): string {
    const baseMessage = `Hi ${customer.contact_name},

I noticed ${customer.company_name} is dealing with ${customer.monthly_tickets} support tickets monthly with a team of ${customer.team_size} people. 

We're launching a beta program for SupportIQ - an AI-powered support automation platform that's helping companies reduce ticket volume by 68% while improving response times from 8+ hours to under 2.3 hours.

Would you be interested in joining our exclusive beta program? You'd get:
• 50% discount for 3 months
• Dedicated onboarding support
• Early access to new features
• Direct input on product development

Let me know if you'd like to schedule a quick 15-minute call to discuss how this could help ${customer.company_name}.

Best regards,
The SupportIQ Team`;

    return baseMessage;
  }

  private async sendActualInvitation(customer: BetaCustomer, invitation: any): Promise<void> {
    // This would integrate with email/LinkedIn APIs
    console.log(`Sending ${invitation.type} invitation to ${customer.email}`);
    
    // For now, just log the invitation
    await this.supabase
      .from('invitation_logs')
      .insert({
        customer_id: customer.id,
        invitation_id: invitation.id,
        sent_at: new Date().toISOString(),
        status: 'sent'
      });
  }

  async recordFeedbackSession(session: Omit<FeedbackSession, 'id'>): Promise<FeedbackSession> {
    try {
      const newSession: FeedbackSession = {
        ...session,
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const { data, error } = await this.supabase
        .from('feedback_sessions')
        .insert(newSession)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording feedback session:', error);
      throw error;
    }
  }

  async getBetaCustomerFeedback(customerId: string): Promise<FeedbackSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('feedback_sessions')
        .select('*')
        .eq('customer_id', customerId)
        .order('session_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting beta customer feedback:', error);
      return [];
    }
  }

  async getBetaProgramMetrics(): Promise<any> {
    try {
      const { data: customers } = await this.supabase
        .from('beta_customers')
        .select('*');

      const { data: feedback } = await this.supabase
        .from('feedback_sessions')
        .select('*');

      if (!customers || !feedback) return null;

      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(c => c.status === 'active').length;
      const avgSatisfaction = feedback.reduce((sum, f) => sum + f.satisfaction_score, 0) / feedback.length;
      const wouldRecommend = feedback.filter(f => f.would_recommend).length / feedback.length * 100;

      // Collect common feedback themes
      const allFeatureRequests = feedback.flatMap(f => f.feature_requests);
      const allPainPoints = feedback.flatMap(f => f.pain_points);
      const allSuggestions = feedback.flatMap(f => f.suggestions);

      return {
        total_customers: totalCustomers,
        active_customers: activeCustomers,
        conversion_rate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
        avg_satisfaction: avgSatisfaction,
        recommendation_rate: wouldRecommend,
        top_feature_requests: this.getTopItems(allFeatureRequests),
        top_pain_points: this.getTopItems(allPainPoints),
        top_suggestions: this.getTopItems(allSuggestions)
      };
    } catch (error) {
      console.error('Error getting beta program metrics:', error);
      return null;
    }
  }

  private getTopItems(items: string[], limit: number = 5): { item: string; count: number }[] {
    const itemCounts: { [key: string]: number } = {};
    
    items.forEach(item => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    });

    return Object.entries(itemCounts)
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async onboardBetaCustomer(customerId: string): Promise<void> {
    try {
      // Update status
      await this.updateBetaCustomerStatus(customerId, 'onboarded');

      // Create onboarding checklist
      const onboardingTasks = [
        'Welcome email sent',
        'Account setup completed',
        'Intercom integration configured',
        'First data sync completed',
        'Initial training session scheduled'
      ];

      for (const task of onboardingTasks) {
        await this.supabase
          .from('onboarding_tasks')
          .insert({
            customer_id: customerId,
            task,
            status: 'pending',
            created_at: new Date().toISOString()
          });
      }

      // Send welcome email
      await this.sendWelcomeEmail(customerId);

      // Schedule first feedback session
      await this.scheduleFeedbackSession(customerId, 'onboarding');
    } catch (error) {
      console.error('Error onboarding beta customer:', error);
      throw error;
    }
  }

  private async sendWelcomeEmail(customerId: string): Promise<void> {
    // Send welcome email with onboarding instructions
    console.log(`Sending welcome email to customer ${customerId}`);
  }

  private async scheduleFeedbackSession(customerId: string, type: string): Promise<void> {
    // Schedule feedback session for 1 week from now
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() + 7);

    await this.supabase
      .from('scheduled_feedback')
      .insert({
        customer_id: customerId,
        session_type: type,
        scheduled_date: sessionDate.toISOString(),
        status: 'scheduled'
      });
  }

  async generateBetaReport(): Promise<any> {
    try {
      const metrics = await this.getBetaProgramMetrics();
      const customers = await this.supabase
        .from('beta_customers')
        .select('*')
        .then(result => result.data || []);

      const feedback = await this.supabase
        .from('feedback_sessions')
        .select('*')
        .then(result => result.data || []);

      return {
        summary: {
          total_beta_customers: customers.length,
          active_customers: customers.filter(c => c.status === 'active').length,
          avg_satisfaction: metrics?.avg_satisfaction || 0,
          recommendation_rate: metrics?.recommendation_rate || 0
        },
        customer_profiles: customers.map(c => ({
          company: c.company_name,
          industry: c.industry,
          team_size: c.team_size,
          monthly_tickets: c.monthly_tickets,
          status: c.status,
          priority_score: c.priority_score
        })),
        feedback_insights: {
          top_feature_requests: metrics?.top_feature_requests || [],
          top_pain_points: metrics?.top_pain_points || [],
          top_suggestions: metrics?.top_suggestions || []
        },
        recommendations: this.generateRecommendations(customers, feedback)
      };
    } catch (error) {
      console.error('Error generating beta report:', error);
      return null;
    }
  }

  private generateRecommendations(customers: BetaCustomer[], feedback: FeedbackSession[]): string[] {
    const recommendations: string[] = [];

    // Analyze customer profiles
    const avgTeamSize = customers.reduce((sum, c) => sum + c.team_size, 0) / customers.length;
    const avgTickets = customers.reduce((sum, c) => sum + c.monthly_tickets, 0) / customers.length;

    if (avgTeamSize > 10) {
      recommendations.push('Focus on enterprise features and team collaboration tools');
    }

    if (avgTickets > 500) {
      recommendations.push('Prioritize high-volume automation and scalability features');
    }

    // Analyze feedback
    const avgSatisfaction = feedback.reduce((sum, f) => sum + f.satisfaction_score, 0) / feedback.length;
    if (avgSatisfaction < 4.0) {
      recommendations.push('Address onboarding and user experience issues');
    }

    return recommendations;
  }
} 