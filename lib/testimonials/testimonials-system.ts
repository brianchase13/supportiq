import { createClient } from '@supabase/supabase-js';

interface Testimonial {
  id: string;
  user_id: string;
  customer_name: string;
  company_name: string;
  role: string;
  industry: string;
  testimonial_text: string;
  rating: number;
  metrics: TestimonialMetrics;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  featured: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags: string[];
  use_case: string;
  challenges: string[];
  solutions: string[];
  results: string[];
}

interface TestimonialMetrics {
  tickets_before: number;
  tickets_after: number;
  deflection_rate: number;
  response_time_improvement: number;
  cost_savings: number;
  roi_percentage: number;
  satisfaction_improvement: number;
  team_size: number;
  implementation_time: string;
}

interface CaseStudy {
  id: string;
  testimonial_id: string;
  title: string;
  subtitle: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: TestimonialMetrics;
  featured_image?: string;
  content: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  tags: string[];
}

interface TestimonialRequest {
  id: string;
  user_id: string;
  request_type: 'email' | 'in_app' | 'phone';
  status: 'pending' | 'sent' | 'responded' | 'completed' | 'declined';
  sent_at?: string;
  responded_at?: string;
  message: string;
  follow_up_count: number;
  last_follow_up?: string;
  created_at: string;
}

export class TestimonialsSystem {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async identifyHighROIUsers(minROI: number = 1000): Promise<any[]> {
    try {
      // Get users with high ROI
      const { data: users } = await this.supabase
        .from('users')
        .select(`
          *,
          daily_metrics!inner(roi_percentage, deflection_rate, customer_satisfaction_score)
        `)
        .gte('daily_metrics.roi_percentage', minROI)
        .gte('daily_metrics.deflection_rate', 50)
        .gte('daily_metrics.customer_satisfaction_score', 4.0);

      if (!users) return [];

      // Filter and rank users
      const qualifiedUsers = users
        .filter((user: any) => {
          const avgROI = user.daily_metrics.reduce((sum: number, m: any) => sum + m.roi_percentage, 0) / user.daily_metrics.length;
          const avgDeflection = user.daily_metrics.reduce((sum: number, m: any) => sum + m.deflection_rate, 0) / user.daily_metrics.length;
          const avgSatisfaction = user.daily_metrics.reduce((sum: number, m: any) => sum + m.customer_satisfaction_score, 0) / user.daily_metrics.length;
          
          return avgROI >= minROI && avgDeflection >= 50 && avgSatisfaction >= 4.0;
        })
        .map((user: any) => {
          const avgROI = user.daily_metrics.reduce((sum: number, m: any) => sum + m.roi_percentage, 0) / user.daily_metrics.length;
          const avgDeflection = user.daily_metrics.reduce((sum: number, m: any) => sum + m.deflection_rate, 0) / user.daily_metrics.length;
          
          return {
            ...user,
            avg_roi: avgROI,
            avg_deflection: avgDeflection,
            priority_score: (avgROI / 100) + (avgDeflection / 10)
          };
        })
        .sort((a: any, b: any) => b.priority_score - a.priority_score);

      return qualifiedUsers;
    } catch (error) {
      console.error('Error identifying high ROI users:', error);
      return [];
    }
  }

  async requestTestimonial(userId: string, requestType: 'email' | 'in_app' | 'phone'): Promise<TestimonialRequest> {
    try {
      // Check if user already has a testimonial request
      const { data: existingRequest } = await this.supabase
        .from('testimonial_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        throw new Error('Testimonial request already exists for this user');
      }

      // Get user profile
      const { data: user } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      // Generate personalized message
      const message = this.generateTestimonialRequestMessage(user, requestType);

      const testimonialRequest: TestimonialRequest = {
        id: `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        request_type: requestType,
        status: 'pending',
        message,
        follow_up_count: 0,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('testimonial_requests')
        .insert(testimonialRequest)
        .select()
        .single();

      if (error) throw error;

      // Send the actual request
      await this.sendTestimonialRequest(user, testimonialRequest);

      return data;
    } catch (error) {
      console.error('Error requesting testimonial:', error);
      throw error;
    }
  }

  private generateTestimonialRequestMessage(user: any, requestType: string): string {
    const baseMessage = `Hi ${user.full_name || 'there'},

I hope you're doing well! I noticed that ${user.company_name || 'your company'} has been achieving incredible results with SupportIQ:

• ${user.avg_roi?.toFixed(0) || '1000'}% ROI
• ${user.avg_deflection?.toFixed(0) || '60'}% ticket deflection rate
• Significant cost savings and improved customer satisfaction

We'd love to share your success story with other companies who could benefit from similar results. Would you be willing to share a brief testimonial about your experience with SupportIQ?

Your feedback would help other support teams understand the real value of AI-powered support automation.

Thank you for considering this request!

Best regards,
The SupportIQ Team`;

    return baseMessage;
  }

  private async sendTestimonialRequest(user: any, request: TestimonialRequest): Promise<void> {
    try {
      // Send email request
      await this.supabase
        .from('email_queue')
        .insert({
          to: user.email,
          subject: 'Share Your SupportIQ Success Story',
          template: 'testimonial_request',
          data: {
            user_name: user.full_name,
            company_name: user.company_name,
            message: request.message
          },
          created_at: new Date().toISOString()
        });

      // Update request status
      await this.supabase
        .from('testimonial_requests')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', request.id);
    } catch (error) {
      console.error('Error sending testimonial request:', error);
    }
  }

  async submitTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Testimonial> {
    try {
      const newTestimonial: Testimonial = {
        ...testimonial,
        id: `testimonial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('testimonials')
        .insert(newTestimonial)
        .select()
        .single();

      if (error) throw error;

      // Update testimonial request status
      await this.supabase
        .from('testimonial_requests')
        .update({
          status: 'completed',
          responded_at: new Date().toISOString()
        })
        .eq('user_id', testimonial.user_id)
        .eq('status', 'sent');

      return data;
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      throw error;
    }
  }

  async approveTestimonial(testimonialId: string): Promise<void> {
    try {
      await this.supabase
        .from('testimonials')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', testimonialId);
    } catch (error) {
      console.error('Error approving testimonial:', error);
      throw error;
    }
  }

  async publishTestimonial(testimonialId: string): Promise<void> {
    try {
      await this.supabase
        .from('testimonials')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', testimonialId);
    } catch (error) {
      console.error('Error publishing testimonial:', error);
      throw error;
    }
  }

  async createCaseStudy(caseStudy: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>): Promise<CaseStudy> {
    try {
      const newCaseStudy: CaseStudy = {
        ...caseStudy,
        id: `case_study_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('case_studies')
        .insert(newCaseStudy)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating case study:', error);
      throw error;
    }
  }

  async getPublishedTestimonials(filters?: {
    industry?: string;
    use_case?: string;
    min_rating?: number;
    featured?: boolean;
  }): Promise<Testimonial[]> {
    try {
      let query = this.supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }

      if (filters?.use_case) {
        query = query.eq('use_case', filters.use_case);
      }

      if (filters?.min_rating) {
        query = query.gte('rating', filters.min_rating);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting published testimonials:', error);
      return [];
    }
  }

  async getFeaturedTestimonials(limit: number = 6): Promise<Testimonial[]> {
    try {
      const { data, error } = await this.supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting featured testimonials:', error);
      return [];
    }
  }

  async getTestimonialStats(): Promise<any> {
    try {
      const { data: testimonials } = await this.supabase
        .from('testimonials')
        .select('*');

      const { data: requests } = await this.supabase
        .from('testimonial_requests')
        .select('*');

      if (!testimonials || !requests) return null;

      const totalTestimonials = testimonials.length;
      const publishedTestimonials = testimonials.filter((t: any) => t.status === 'published').length;
      const featuredTestimonials = testimonials.filter((t: any) => t.featured).length;
      const avgRating = testimonials.reduce((sum: number, t: any) => sum + t.rating, 0) / totalTestimonials;

      const totalRequests = requests.length;
      const completedRequests = requests.filter((r: any) => r.status === 'completed').length;
      const responseRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

      // Industry breakdown
      const industryBreakdown = testimonials.reduce((acc: any, t: any) => {
        acc[t.industry] = (acc[t.industry] || 0) + 1;
        return acc;
      }, {});

      return {
        total_testimonials: totalTestimonials,
        published_testimonials: publishedTestimonials,
        featured_testimonials: featuredTestimonials,
        avg_rating: avgRating,
        total_requests: totalRequests,
        completed_requests: completedRequests,
        response_rate: responseRate,
        industry_breakdown: industryBreakdown
      };
    } catch (error) {
      console.error('Error getting testimonial stats:', error);
      return null;
    }
  }

  async followUpTestimonialRequest(requestId: string): Promise<void> {
    try {
      const { data: request } = await this.supabase
        .from('testimonial_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (!request) throw new Error('Request not found');

      // Generate follow-up message
      const followUpMessage = this.generateFollowUpMessage(request);

      // Send follow-up
      await this.supabase
        .from('email_queue')
        .insert({
          to: request.user_id, // Would need to get user email
          subject: 'Following up on your SupportIQ testimonial',
          template: 'testimonial_followup',
          data: {
            message: followUpMessage
          },
          created_at: new Date().toISOString()
        });

      // Update follow-up count
      await this.supabase
        .from('testimonial_requests')
        .update({
          follow_up_count: request.follow_up_count + 1,
          last_follow_up: new Date().toISOString()
        })
        .eq('id', requestId);
    } catch (error) {
      console.error('Error following up testimonial request:', error);
    }
  }

  private generateFollowUpMessage(request: TestimonialRequest): string {
    return `Hi there,

I wanted to follow up on my previous message about sharing your SupportIQ success story. 

We've seen amazing results from your implementation and would love to highlight your experience to help other companies achieve similar success.

If you have a few minutes, we'd really appreciate your feedback. It would mean a lot to our team and could help other support teams make the right decision.

Thank you for your time!

Best regards,
The SupportIQ Team`;
  }

  async generateTestimonialPage(): Promise<any> {
    try {
      const featuredTestimonials = await this.getFeaturedTestimonials(6);
      const stats = await this.getTestimonialStats();
      const industries = await this.getTestimonialsByIndustry();

      return {
        featured_testimonials: featuredTestimonials,
        stats: stats,
        industries: industries,
        seo: {
          title: 'Customer Success Stories & Testimonials | SupportIQ',
          description: 'See how companies are achieving 1000%+ ROI with SupportIQ. Read real customer testimonials and case studies.',
          keywords: ['testimonials', 'customer success', 'case studies', 'ROI', 'support automation']
        }
      };
    } catch (error) {
      console.error('Error generating testimonial page:', error);
      return null;
    }
  }

  private async getTestimonialsByIndustry(): Promise<any> {
    try {
      const { data: testimonials } = await this.supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'published');

      if (!testimonials) return [];

      const industryGroups = testimonials.reduce((acc: any, testimonial: any) => {
        if (!acc[testimonial.industry]) {
          acc[testimonial.industry] = [];
        }
        acc[testimonial.industry].push(testimonial);
        return acc;
      }, {});

      return Object.entries(industryGroups).map(([industry, testimonials]: [string, any]) => ({
        industry,
        testimonials: (testimonials as any[]).slice(0, 3), // Top 3 per industry
        count: (testimonials as any[]).length
      }));
    } catch (error) {
      console.error('Error getting testimonials by industry:', error);
      return [];
    }
  }
} 