import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

interface Ticket {
  id: string;
  subject: string;
  body: string;
  customer_email: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface DeflectionResponse {
  id: string;
  ticket_id: string;
  response: string;
  confidence: number;
  category: string;
  template_used?: string;
  auto_sent: boolean;
  created_at: string;
}

interface DeflectionSettings {
  enabled: boolean;
  autoRespond: boolean;
  deflectionThreshold: number;
  responseTemplates: ResponseTemplate[];
  categories: Category[];
  workingHours: WorkingHours;
}

interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  active: boolean;
  keywords: string[];
}

interface Category {
  id: string;
  name: string;
  enabled: boolean;
  threshold: number;
}

interface WorkingHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface DeflectionResult {
  shouldDeflect: boolean;
  confidence: number;
  response: string;
  category: string;
  template_used?: string;
  reasoning: string;
  estimatedSavings: number;
}

export class TicketDeflectionEngine {
  private openai: OpenAI;
  private supabase: any;
  private settings: DeflectionSettings;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.settings = this.getDefaultSettings();
  }

  private getDefaultSettings(): DeflectionSettings {
    return {
      enabled: true,
      autoRespond: true,
      deflectionThreshold: 0.8,
      responseTemplates: [
        {
          id: '1',
          name: 'FAQ Response',
          content: 'Hi there! I found a helpful answer to your question in our FAQ: [LINK]. This should resolve your issue. Let me know if you need anything else!',
          category: 'general',
          active: true,
          keywords: ['how', 'what', 'where', 'when', 'why', 'faq', 'help']
        },
        {
          id: '2',
          name: 'Account Access',
          content: 'I can help you with account access. Please try resetting your password here: [LINK]. If that doesn\'t work, I\'ll escalate this to our team.',
          category: 'account',
          active: true,
          keywords: ['password', 'login', 'access', 'account', 'reset', 'forgot']
        },
        {
          id: '3',
          name: 'Billing Inquiry',
          content: 'Thank you for your billing question. You can view your billing information and make changes here: [LINK]. If you need further assistance, I\'ll connect you with our billing team.',
          category: 'billing',
          active: true,
          keywords: ['billing', 'payment', 'invoice', 'charge', 'subscription', 'plan']
        }
      ],
      categories: [
        { id: '1', name: 'General Questions', enabled: true, threshold: 0.8 },
        { id: '2', name: 'Account Issues', enabled: true, threshold: 0.7 },
        { id: '3', name: 'Billing', enabled: false, threshold: 0.9 },
        { id: '4', name: 'Technical Support', enabled: true, threshold: 0.6 },
        { id: '5', name: 'Feature Requests', enabled: false, threshold: 0.8 }
      ],
      workingHours: {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York'
      }
    };
  }

  async loadUserSettings(userId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('deflection_settings')
        .eq('user_id', userId)
        .single();

      if (data?.deflection_settings) {
        this.settings = { ...this.settings, ...data.deflection_settings };
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  }

  async analyzeTicket(ticket: Ticket): Promise<DeflectionResult> {
    if (!this.settings.enabled) {
      return {
        shouldDeflect: false,
        confidence: 0,
        response: '',
        category: '',
        reasoning: 'Deflection is disabled',
        estimatedSavings: 0
      };
    }

    // Check working hours
    if (this.settings.workingHours.enabled && !this.isWithinWorkingHours()) {
      return {
        shouldDeflect: false,
        confidence: 0,
        response: '',
        category: '',
        reasoning: 'Outside working hours',
        estimatedSavings: 0
      };
    }

    // Analyze ticket content
    const analysis = await this.analyzeTicketContent(ticket);
    
    // Find best matching template
    const template = this.findBestTemplate(ticket, analysis);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(analysis, template);
    
    // Determine if should deflect
    const shouldDeflect = confidence >= this.settings.deflectionThreshold;
    
    // Generate response
    const response = shouldDeflect ? this.generateResponse(ticket, template, analysis) : '';
    
    // Calculate estimated savings
    const estimatedSavings = shouldDeflect ? this.calculateSavings(ticket) : 0;

    return {
      shouldDeflect,
      confidence,
      response,
      category: analysis.category,
      template_used: template?.id,
      reasoning: this.generateReasoning(analysis, template, confidence),
      estimatedSavings
    };
  }

  private async analyzeTicketContent(ticket: Ticket): Promise<any> {
    const prompt = `
Analyze this support ticket and provide insights for automated response:

Ticket Subject: ${ticket.subject}
Ticket Body: ${ticket.body}
Priority: ${ticket.priority}
Category: ${ticket.category || 'unknown'}

Please analyze and return a JSON object with:
1. category: The most likely category (general, account, billing, technical, feature_request)
2. complexity: Low, Medium, or High
3. sentiment: Positive, Neutral, or Negative
4. urgency: Low, Medium, or High
5. keywords: Array of key terms that indicate the issue type
6. can_auto_resolve: Boolean indicating if this can be automatically resolved
7. confidence: Number between 0-1 indicating confidence in auto-resolution
8. reasoning: Brief explanation of the analysis

Focus on identifying tickets that can be resolved with standard responses, FAQ links, or simple instructions.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        return JSON.parse(response);
      }
    } catch (error) {
      console.error('Error analyzing ticket content:', error);
    }

    // Fallback analysis
    return {
      category: 'general',
      complexity: 'Medium',
      sentiment: 'Neutral',
      urgency: 'Medium',
      keywords: [],
      can_auto_resolve: false,
      confidence: 0.3,
      reasoning: 'Analysis failed, defaulting to manual review'
    };
  }

  private findBestTemplate(ticket: Ticket, analysis: any): ResponseTemplate | null {
    const activeTemplates = this.settings.responseTemplates.filter(t => t.active);
    
    let bestTemplate: ResponseTemplate | null = null;
    let bestScore = 0;

    for (const template of activeTemplates) {
      const score = this.calculateTemplateScore(ticket, template, analysis);
      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }

    return bestTemplate;
  }

  private calculateTemplateScore(ticket: Ticket, template: ResponseTemplate, analysis: any): number {
    let score = 0;
    
    // Category match
    if (template.category === analysis.category) {
      score += 0.4;
    }
    
    // Keyword matching
    const ticketText = `${ticket.subject} ${ticket.body}`.toLowerCase();
    const keywordMatches = template.keywords.filter(keyword => 
      ticketText.includes(keyword.toLowerCase())
    ).length;
    
    score += (keywordMatches / template.keywords.length) * 0.3;
    
    // Priority consideration
    if (ticket.priority === 'low' || ticket.priority === 'medium') {
      score += 0.2;
    }
    
    // Complexity consideration
    if (analysis.complexity === 'Low') {
      score += 0.1;
    }
    
    return Math.min(score, 1);
  }

  private calculateConfidence(analysis: any, template: ResponseTemplate | null): number {
    let confidence = analysis.confidence || 0.3;
    
    if (template) {
      confidence += 0.2; // Template match bonus
    }
    
    // Adjust based on complexity
    if (analysis.complexity === 'Low') {
      confidence += 0.1;
    } else if (analysis.complexity === 'High') {
      confidence -= 0.2;
    }
    
    // Adjust based on urgency
    if (analysis.urgency === 'High') {
      confidence -= 0.1;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  private generateResponse(ticket: Ticket, template: ResponseTemplate, analysis: any): string {
    let response = template.content;
    
    // Personalize response
    response = response.replace('[CUSTOMER_NAME]', this.extractCustomerName(ticket.customer_email));
    
    // Add relevant links based on category
    response = this.addRelevantLinks(response, analysis.category);
    
    // Add follow-up based on confidence
    if (analysis.confidence < 0.9) {
      response += '\n\nIf this doesn\'t resolve your issue, please let me know and I\'ll connect you with our support team.';
    }
    
    return response;
  }

  private extractCustomerName(email: string): string {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private addRelevantLinks(response: string, category: string): string {
    const links: { [key: string]: string } = {
      general: 'https://support.example.com/faq',
      account: 'https://support.example.com/account-help',
      billing: 'https://support.example.com/billing',
      technical: 'https://support.example.com/technical-support',
      feature_request: 'https://support.example.com/feature-requests'
    };
    
    return response.replace('[LINK]', links[category] || links.general);
  }

  private calculateSavings(ticket: Ticket): number {
    // Base savings calculation: $25/hour * 0.1 hours per ticket
    const baseSavings = 25 * 0.1;
    
    // Adjust based on priority
    const priorityMultiplier = {
      low: 1.0,
      medium: 1.2,
      high: 1.5,
      urgent: 2.0
    };
    
    return baseSavings * (priorityMultiplier[ticket.priority] || 1.0);
  }

  private generateReasoning(analysis: any, template: ResponseTemplate | null, confidence: number): string {
    let reasoning = `Confidence: ${Math.round(confidence * 100)}%. `;
    
    if (template) {
      reasoning += `Matched template: ${template.name}. `;
    }
    
    reasoning += `Category: ${analysis.category}. `;
    reasoning += `Complexity: ${analysis.complexity}. `;
    reasoning += analysis.reasoning || 'Standard auto-resolution criteria met.';
    
    return reasoning;
  }

  private isWithinWorkingHours(): boolean {
    if (!this.settings.workingHours.enabled) {
      return true;
    }

    const now = new Date();
    const timezone = this.settings.workingHours.timezone;
    
    // Convert to user's timezone
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const currentTime = userTime.getHours() * 60 + userTime.getMinutes();
    
    const [startHour, startMin] = this.settings.workingHours.startTime.split(':').map(Number);
    const [endHour, endMin] = this.settings.workingHours.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return currentTime >= startMinutes && currentTime <= endMinutes;
  }

  async sendIntercomResponse(ticketId: string, response: string, userId: string): Promise<boolean> {
    try {
      // Get Intercom access token from user settings
      const { data: settings } = await this.supabase
        .from('user_settings')
        .select('intercom_settings')
        .eq('user_id', userId)
        .single();

      if (!settings?.intercom_settings?.access_token) {
        throw new Error('Intercom not connected');
      }

      // Send reply via Intercom API
      const intercomResponse = await fetch(`https://api.intercom.io/conversations/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.intercom_settings.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message_type: 'comment',
          body: response,
          type: 'admin'
        })
      });

      if (!intercomResponse.ok) {
        throw new Error(`Intercom API error: ${intercomResponse.status}`);
      }

      // Log the response
      await this.logDeflectionResponse(ticketId, response, 1.0, 'auto_sent', userId);

      return true;
    } catch (error) {
      console.error('Error sending Intercom response:', error);
      return false;
    }
  }

  private async logDeflectionResponse(
    ticketId: string, 
    response: string, 
    confidence: number, 
    category: string, 
    userId: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('deflection_responses')
        .insert({
          ticket_id: ticketId,
          response,
          confidence,
          category,
          auto_sent: true,
          user_id: userId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging deflection response:', error);
    }
  }

  async getDeflectionStats(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('deflection_responses')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const total = data.length;
      const autoSent = data.filter(r => r.auto_sent).length;
      const avgConfidence = data.reduce((sum, r) => sum + r.confidence, 0) / total;

      return {
        total_responses: total,
        auto_sent: autoSent,
        manual_review: total - autoSent,
        success_rate: total > 0 ? (autoSent / total) * 100 : 0,
        avg_confidence: avgConfidence,
        estimated_savings: autoSent * 2.5 // $2.50 per auto-resolved ticket
      };
    } catch (error) {
      console.error('Error getting deflection stats:', error);
      return null;
    }
  }
} 