import { createClient } from '@supabase/supabase-js';

interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  tags: string[];
  keywords: string[];
  variables: TemplateVariable[];
  active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  usage_count: number;
  success_rate: number;
  avg_response_time: number;
  user_id: string;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'url' | 'email' | 'number' | 'date' | 'select';
  placeholder: string;
  required: boolean;
  options?: string[]; // For select type
  default_value?: string;
}

interface TemplateMatch {
  template: ResponseTemplate;
  score: number;
  matched_keywords: string[];
  reasoning: string;
}

interface TemplateAnalytics {
  total_uses: number;
  success_rate: number;
  avg_response_time: number;
  customer_satisfaction: number;
  deflection_rate: number;
  category_performance: { [key: string]: number };
  keyword_performance: { [key: string]: number };
}

export class ResponseTemplateSystem {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async createTemplate(template: Omit<ResponseTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'success_rate' | 'avg_response_time'>): Promise<ResponseTemplate> {
    try {
      const newTemplate: ResponseTemplate = {
        ...template,
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        success_rate: 0,
        avg_response_time: 0
      };

      const { data, error } = await this.supabase
        .from('response_templates')
        .insert(newTemplate)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  async updateTemplate(templateId: string, updates: Partial<ResponseTemplate>): Promise<ResponseTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('response_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('response_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  async getTemplates(userId: string, filters?: {
    category?: string;
    active?: boolean;
    search?: string;
  }): Promise<ResponseTemplate[]> {
    try {
      let query = this.supabase
        .from('response_templates')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  async findBestTemplate(ticket: {
    subject: string;
    body: string;
    category?: string;
    tags?: string[];
    priority?: string;
  }, userId: string): Promise<TemplateMatch | null> {
    try {
      const templates = await this.getTemplates(userId, { active: true });
      const ticketText = `${ticket.subject} ${ticket.body}`.toLowerCase();
      
      let bestMatch: TemplateMatch | null = null;
      let bestScore = 0;

      for (const template of templates) {
        const match = this.calculateTemplateMatch(ticket, template, ticketText);
        
        if (match.score > bestScore) {
          bestScore = match.score;
          bestMatch = match;
        }
      }

      return bestMatch;
    } catch (error) {
      console.error('Error finding best template:', error);
      return null;
    }
  }

  private calculateTemplateMatch(
    ticket: any, 
    template: ResponseTemplate, 
    ticketText: string
  ): TemplateMatch {
    let score = 0;
    const matchedKeywords: string[] = [];
    let reasoning = '';

    // Category match
    if (ticket.category && template.category === ticket.category) {
      score += 0.3;
      reasoning += 'Category match. ';
    }

    // Keyword matching
    for (const keyword of template.keywords) {
      if (ticketText.includes(keyword.toLowerCase())) {
        score += 0.1;
        matchedKeywords.push(keyword);
      }
    }

    // Tag matching
    if (ticket.tags && template.tags) {
      const commonTags = ticket.tags.filter((tag: string) => 
        template.tags.includes(tag)
      );
      score += commonTags.length * 0.05;
      if (commonTags.length > 0) {
        reasoning += `Tag matches: ${commonTags.join(', ')}. `;
      }
    }

    // Priority consideration
    if (ticket.priority === 'low' && template.priority > 5) {
      score += 0.1;
    } else if (ticket.priority === 'high' && template.priority < 5) {
      score -= 0.1;
    }

    // Success rate bonus
    score += template.success_rate * 0.2;

    reasoning += `Matched ${matchedKeywords.length} keywords: ${matchedKeywords.join(', ')}. `;
    reasoning += `Final score: ${score.toFixed(2)}.`;

    return {
      template,
      score: Math.min(score, 1),
      matched_keywords: matchedKeywords,
      reasoning
    };
  }

  async renderTemplate(template: ResponseTemplate, variables: { [key: string]: any }): Promise<string> {
    let content = template.content;

    // Replace variables in template
    for (const variable of template.variables) {
      const value = variables[variable.name] || variable.default_value || '';
      const placeholder = `{{${variable.name}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    // Replace common placeholders
    const commonReplacements = {
      '{{CUSTOMER_NAME}}': variables.customer_name || 'there',
      '{{COMPANY_NAME}}': variables.company_name || 'our team',
      '{{SUPPORT_EMAIL}}': variables.support_email || 'support@example.com',
      '{{CURRENT_DATE}}': new Date().toLocaleDateString(),
      '{{TICKET_ID}}': variables.ticket_id || '',
      '{{AGENT_NAME}}': variables.agent_name || 'Support Team'
    };

    for (const [placeholder, value] of Object.entries(commonReplacements)) {
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    return content;
  }

  async logTemplateUsage(templateId: string, ticketId: string, success: boolean, responseTime: number): Promise<void> {
    try {
      // Update template stats
      const { data: template } = await this.supabase
        .from('response_templates')
        .select('usage_count, success_rate, avg_response_time')
        .eq('id', templateId)
        .single();

      if (template) {
        const newUsageCount = template.usage_count + 1;
        const newSuccessRate = ((template.success_rate * template.usage_count) + (success ? 1 : 0)) / newUsageCount;
        const newAvgResponseTime = ((template.avg_response_time * template.usage_count) + responseTime) / newUsageCount;

        await this.supabase
          .from('response_templates')
          .update({
            usage_count: newUsageCount,
            success_rate: newSuccessRate,
            avg_response_time: newAvgResponseTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);
      }

      // Log usage record
      await this.supabase
        .from('template_usage_logs')
        .insert({
          template_id: templateId,
          ticket_id: ticketId,
          success,
          response_time: responseTime,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging template usage:', error);
    }
  }

  async getTemplateAnalytics(userId: string, days: number = 30): Promise<TemplateAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get template usage data
      const { data: usageLogs } = await this.supabase
        .from('template_usage_logs')
        .select(`
          *,
          response_templates!inner(user_id, category, keywords)
        `)
        .eq('response_templates.user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (!usageLogs) {
        return {
          total_uses: 0,
          success_rate: 0,
          avg_response_time: 0,
          customer_satisfaction: 0,
          deflection_rate: 0,
          category_performance: {},
          keyword_performance: {}
        };
      }

      const totalUses = usageLogs.length;
      const successfulUses = usageLogs.filter(log => log.success).length;
      const successRate = totalUses > 0 ? successfulUses / totalUses : 0;
      const avgResponseTime = usageLogs.reduce((sum, log) => sum + log.response_time, 0) / totalUses;

      // Category performance
      const categoryPerformance: { [key: string]: number } = {};
      usageLogs.forEach(log => {
        const category = log.response_templates.category;
        categoryPerformance[category] = (categoryPerformance[category] || 0) + 1;
      });

      // Keyword performance
      const keywordPerformance: { [key: string]: number } = {};
      usageLogs.forEach(log => {
        const keywords = log.response_templates.keywords || [];
        keywords.forEach(keyword => {
          keywordPerformance[keyword] = (keywordPerformance[keyword] || 0) + 1;
        });
      });

      return {
        total_uses: totalUses,
        success_rate: successRate,
        avg_response_time: avgResponseTime,
        customer_satisfaction: 4.2, // Mock data - would come from customer feedback
        deflection_rate: successRate * 100,
        category_performance: categoryPerformance,
        keyword_performance: keywordPerformance
      };
    } catch (error) {
      console.error('Error getting template analytics:', error);
      return {
        total_uses: 0,
        success_rate: 0,
        avg_response_time: 0,
        customer_satisfaction: 0,
        deflection_rate: 0,
        category_performance: {},
        keyword_performance: {}
      };
    }
  }

  async getDefaultTemplates(): Promise<ResponseTemplate[]> {
    return [
      {
        id: 'default_1',
        name: 'Welcome Response',
        content: 'Hi {{CUSTOMER_NAME}},\n\nThank you for reaching out to {{COMPANY_NAME}}. We\'ve received your message and our team will get back to you as soon as possible.\n\nIn the meantime, you might find answers to common questions in our help center: {{HELP_CENTER_URL}}\n\nBest regards,\n{{AGENT_NAME}}',
        category: 'general',
        tags: ['welcome', 'acknowledgment'],
        keywords: ['hello', 'hi', 'help', 'support'],
        variables: [
          {
            name: 'HELP_CENTER_URL',
            type: 'url',
            placeholder: 'https://help.example.com',
            required: true
          }
        ],
        active: true,
        priority: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        success_rate: 0,
        avg_response_time: 0,
        user_id: ''
      },
      {
        id: 'default_2',
        name: 'Password Reset',
        content: 'Hi {{CUSTOMER_NAME}},\n\nI can help you reset your password. Please visit this link to create a new password: {{RESET_URL}}\n\nIf you continue to have issues, please let me know and I\'ll escalate this to our technical team.\n\nBest regards,\n{{AGENT_NAME}}',
        category: 'account',
        tags: ['password', 'reset', 'account'],
        keywords: ['password', 'reset', 'forgot', 'login', 'access'],
        variables: [
          {
            name: 'RESET_URL',
            type: 'url',
            placeholder: 'https://example.com/reset-password',
            required: true
          }
        ],
        active: true,
        priority: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        success_rate: 0,
        avg_response_time: 0,
        user_id: ''
      },
      {
        id: 'default_3',
        name: 'Billing Inquiry',
        content: 'Hi {{CUSTOMER_NAME}},\n\nThank you for your billing question. You can view your current billing information and make changes here: {{BILLING_URL}}\n\nIf you need to speak with our billing team directly, please reply to this message and I\'ll connect you with them.\n\nBest regards,\n{{AGENT_NAME}}',
        category: 'billing',
        tags: ['billing', 'payment', 'invoice'],
        keywords: ['billing', 'payment', 'invoice', 'charge', 'subscription'],
        variables: [
          {
            name: 'BILLING_URL',
            type: 'url',
            placeholder: 'https://example.com/billing',
            required: true
          }
        ],
        active: true,
        priority: 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        success_rate: 0,
        avg_response_time: 0,
        user_id: ''
      }
    ];
  }

  async importDefaultTemplates(userId: string): Promise<void> {
    try {
      const defaultTemplates = await this.getDefaultTemplates();
      
      for (const template of defaultTemplates) {
        await this.createTemplate({
          ...template,
          user_id: userId
        });
      }
    } catch (error) {
      console.error('Error importing default templates:', error);
      throw error;
    }
  }

  async duplicateTemplate(templateId: string, userId: string): Promise<ResponseTemplate> {
    try {
      const { data: originalTemplate } = await this.supabase
        .from('response_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (!originalTemplate) {
        throw new Error('Template not found');
      }

      const newTemplate = {
        ...originalTemplate,
        id: undefined,
        name: `${originalTemplate.name} (Copy)`,
        user_id: userId,
        created_at: undefined,
        updated_at: undefined,
        usage_count: 0,
        success_rate: 0,
        avg_response_time: 0
      };

      return await this.createTemplate(newTemplate);
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  }

  async bulkUpdateTemplates(templateIds: string[], updates: Partial<ResponseTemplate>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('response_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', templateIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk updating templates:', error);
      throw error;
    }
  }
}