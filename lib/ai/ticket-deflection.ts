import OpenAI from 'openai';
import { generateEmbedding, findSimilarTickets } from './embeddings';
import { TicketData, TicketAnalysis, DeflectionResponse, TicketMetrics } from '@/lib/types';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface TicketAnalysis {
  id: string;
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  deflectionPotential: 'high' | 'medium' | 'low';
  confidence: number;
  keywords: string[];
  intent: string;
  suggestedResponse?: string;
  similarTickets?: string[];
  estimatedResolutionTime: number; // in minutes
  requiresHuman: boolean;
  tags: string[];
}

// Removed local DeflectionResponse interface, using imported one

export interface TicketMetrics {
  totalTickets: number;
  deflectedTickets: number;
  deflectionRate: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  topIssues: Array<{ issue: string; count: number; percentage: number }>;
  sentimentBreakdown: Array<{ sentiment: string; count: number; percentage: number }>;
}

export class TicketDeflectionEngine {
  private openai: OpenAI | null;
  private knowledgeBase: Map<string, unknown> = new Map();
  private responseTemplates: Map<string, string> = new Map();

  constructor() {
    this.openai = openai;
    this.initializeKnowledgeBase();
    this.initializeResponseTemplates();
  }

  private initializeKnowledgeBase() {
    // Common support scenarios and their deflection strategies
    this.knowledgeBase.set('password_reset', {
      category: 'Account',
      subcategory: 'Authentication',
      deflectionPotential: 'high',
      responseTemplate: 'password_reset',
      keywords: ['password', 'reset', 'forgot', 'login', 'access'],
      estimatedResolutionTime: 5,
      requiresHuman: false
    });

    this.knowledgeBase.set('billing_inquiry', {
      category: 'Billing',
      subcategory: 'Payment',
      deflectionPotential: 'medium',
      responseTemplate: 'billing_inquiry',
      keywords: ['billing', 'payment', 'invoice', 'charge', 'subscription'],
      estimatedResolutionTime: 15,
      requiresHuman: true
    });

    this.knowledgeBase.set('feature_request', {
      category: 'Feature Request',
      subcategory: 'Enhancement',
      deflectionPotential: 'low',
      responseTemplate: 'feature_request',
      keywords: ['feature', 'request', 'add', 'new', 'enhancement'],
      estimatedResolutionTime: 30,
      requiresHuman: true
    });

    this.knowledgeBase.set('bug_report', {
      category: 'Bug',
      subcategory: 'Technical Issue',
      deflectionPotential: 'low',
      responseTemplate: 'bug_report',
      keywords: ['bug', 'error', 'broken', 'not working', 'issue'],
      estimatedResolutionTime: 45,
      requiresHuman: true
    });

    this.knowledgeBase.set('how_to', {
      category: 'How-to',
      subcategory: 'Documentation',
      deflectionPotential: 'high',
      responseTemplate: 'how_to',
      keywords: ['how', 'guide', 'tutorial', 'help', 'documentation'],
      estimatedResolutionTime: 10,
      requiresHuman: false
    });
  }

  private initializeResponseTemplates() {
    this.responseTemplates.set('password_reset', 
      `Hi there! I can help you reset your password.

Here's how to reset your password:
1. Go to our login page
2. Click "Forgot Password?"
3. Enter your email address
4. Check your email for a reset link
5. Click the link and create a new password

If you don't receive the email within 5 minutes, please check your spam folder. Let me know if you need any further assistance!`
    );

    this.responseTemplates.set('billing_inquiry',
      `Thanks for reaching out about your billing!

I can see your current subscription details. For billing questions, you can:
1. Check your invoice history in your account settings
2. Update your payment method
3. View your current plan and usage

If you need to speak with our billing team, I'll be happy to escalate this for you. What specific billing question do you have?`
    );

    this.responseTemplates.set('feature_request',
      `Thank you for your feature request! We love hearing from our users about how we can improve our product.

I've logged your request and will share it with our product team. While I can't guarantee when this feature will be available, we do review all requests and prioritize based on user demand.

You can track feature requests and vote on others in our public roadmap: [link]

Is there anything else I can help you with today?`
    );

    this.responseTemplates.set('bug_report',
      `I'm sorry you're experiencing this issue! Let me help you troubleshoot.

To better assist you, could you please provide:
1. What you were trying to do when the error occurred
2. The exact error message you're seeing
3. Your browser/device information
4. Steps to reproduce the issue

This will help our team investigate and resolve the problem quickly.`
    );

    this.responseTemplates.set('how_to',
      `I'd be happy to help you with that!

Here's a step-by-step guide:
[AI-generated steps based on the specific question]

You can also check our help center for more detailed guides: [link]

Let me know if you need any clarification or run into any issues!`
    );
  }

  async analyzeTicket(ticket: unknown, existingTickets: unknown[] = []): Promise<TicketAnalysis> {
    if (!this.openai) {
      return this.generateMockAnalysis(ticket);
    }

    try {
      // Generate embedding for similarity search
      const ticketText = `${ticket.subject || ''} ${ticket.content || ''}`.trim();
      const embedding = await generateEmbedding(ticketText);

      // Find similar tickets
      const similarTickets = findSimilarTickets(embedding, existingTickets, 0.8, 5);

      // Analyze with GPT
      const analysis = await this.performGPTAnalysis(ticket, similarTickets);

      // Enhance with knowledge base
      const enhancedAnalysis = this.enhanceWithKnowledgeBase(analysis, ticketText);

      return {
        ...enhancedAnalysis,
        similarTickets: similarTickets.map(t => t.ticketId),
        id: ticket.id
      };

    } catch (error) {
      console.error('Ticket analysis error:', error);
      return this.generateMockAnalysis(ticket);
    }
  }

  private async performGPTAnalysis(ticket: unknown, similarTickets: unknown[]): Promise<Partial<TicketAnalysis>> {
    const ticketText = `${ticket.subject || ''} ${ticket.content || ''}`;
    
    const prompt = `Analyze this customer support ticket and provide detailed categorization and deflection analysis:

TICKET:
Subject: ${ticket.subject || 'No subject'}
Content: ${ticket.content || 'No content'}

SIMILAR TICKETS (for context):
${similarTickets.map((t, i) => `${i + 1}. ${t.content?.substring(0, 200)}...`).join('\n')}

Provide analysis in this JSON format:
{
  "category": "Account|Billing|Feature Request|Bug|How-to|Technical Issue|Other",
  "subcategory": "specific subcategory",
  "priority": "low|medium|high|urgent",
  "sentiment": "positive|neutral|negative",
  "sentimentScore": -1.0 to 1.0,
  "deflectionPotential": "high|medium|low",
  "confidence": 0.0 to 1.0,
  "keywords": ["keyword1", "keyword2"],
  "intent": "what the user is trying to accomplish",
  "estimatedResolutionTime": minutes,
  "requiresHuman": true/false,
  "tags": ["tag1", "tag2"]
}

Focus on:
1. Accurate categorization for proper routing
2. Sentiment analysis for priority assessment
3. Deflection potential based on question type
4. Keywords for knowledge base matching
5. Whether human intervention is required`;

    const response = await this.openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert customer support analyst. Provide accurate, consistent analysis for ticket categorization and deflection assessment.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  }

  private enhanceWithKnowledgeBase(analysis: Partial<TicketAnalysis>, ticketText: string): TicketAnalysis {
    const lowerText = ticketText.toLowerCase();
    
    // Find best matching knowledge base entry
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, entry] of this.knowledgeBase) {
      const keywordMatches = entry.keywords.filter((keyword: string) => 
        lowerText.includes(keyword.toLowerCase())
      ).length;
      
      const score = keywordMatches / entry.keywords.length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { key, entry };
      }
    }

    // Enhance analysis with knowledge base
    if (bestMatch && bestScore > 0.3) {
      return {
        ...analysis,
        category: analysis.category || bestMatch.entry.category,
        subcategory: analysis.subcategory || bestMatch.entry.subcategory,
        deflectionPotential: analysis.deflectionPotential || bestMatch.entry.deflectionPotential,
        estimatedResolutionTime: analysis.estimatedResolutionTime || bestMatch.entry.estimatedResolutionTime,
        requiresHuman: analysis.requiresHuman ?? bestMatch.entry.requiresHuman,
        confidence: Math.min(analysis.confidence || 0.8, 0.95),
      } as TicketAnalysis;
    }

    return analysis as TicketAnalysis;
  }

  async generateDeflectionResponse(analysis: TicketAnalysis, ticket: unknown): Promise<DeflectionResponse> {
    if (!this.openai) {
      return this.generateMockDeflectionResponse(analysis);
    }

    try {
      // Check if we can deflect based on analysis
      const can_deflect = analysis.deflectionPotential === 'high' && !analysis.requiresHuman;

      if (!can_deflect) {
        return {
          can_deflect: false,
          response_content: this.generateEscalationResponse(analysis),
          confidence: 0.9,
          response_type: 'escalate',
          reasoning: 'Escalation required',
          suggested_actions: ['Escalate to human agent'],
          follow_up_required: true,
          escalation_triggers: ['Complex issue', 'Requires human intervention'],
          estimated_cost: 0,
          tokens_used: 0,
          model_used: 'mock',
          generated_at: new Date().toISOString(),
        };
      }

      // Generate personalized response
      const response = await this.generatePersonalizedResponse(analysis, ticket);

      return {
        can_deflect: true,
        response_content: response.content,
        confidence: response.confidence,
        response_type: 'auto_resolve',
        reasoning: 'Automated deflection',
        suggested_actions: response.suggestedActions,
        follow_up_required: response.followUpRequired,
        escalation_triggers: response.escalationTriggers,
        estimated_cost: 0,
        tokens_used: 0,
        model_used: 'mock',
        generated_at: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Deflection response generation error:', error);
      return this.generateMockDeflectionResponse(analysis);
    }
  }

  private async generatePersonalizedResponse(analysis: TicketAnalysis, ticket: unknown): Promise<unknown> {
    const prompt = `Generate a helpful, personalized response for this customer support ticket:

TICKET ANALYSIS:
- Category: ${analysis.category}
- Intent: ${analysis.intent}
- Keywords: ${analysis.keywords.join(', ')}
- Sentiment: ${analysis.sentiment}

TICKET CONTENT:
${ticket.content}

Generate a response that:
1. Addresses the specific question/issue
2. Provides clear, actionable steps
3. Maintains a helpful, professional tone
4. Includes relevant links or resources if applicable
5. Offers to escalate if needed

Response should be conversational and helpful, not robotic.`;

    const response = await this.openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful customer support agent. Generate personalized, helpful responses that solve customer issues efficiently.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      content: response.choices[0].message.content,
      confidence: 0.85,
      suggestedActions: ['Send automated response', 'Monitor for follow-up'],
      followUpRequired: false,
      escalationTriggers: ['Customer requests escalation', 'Complex follow-up question']
    };
  }

  private generateEscalationResponse(analysis: TicketAnalysis): string {
    return `Thank you for reaching out! I understand your ${analysis.category.toLowerCase()} issue and want to make sure you get the best possible help.

I'm going to escalate this to one of our support specialists who can provide you with personalized assistance. You should receive a response within the next few hours.

In the meantime, if you have any additional details about your issue, please feel free to share them. This will help our team assist you more quickly.

Thank you for your patience!`;
  }

  private generateFallbackMessage(analysis: TicketAnalysis): string {
    return `If this doesn't address your question, please let me know and I'll be happy to connect you with a human agent who can provide more personalized assistance.`;
  }

  calculateDeflectionMetrics(tickets: unknown[]): TicketMetrics {
    const totalTickets = tickets.length;
    const deflectedTickets = tickets.filter(t => t.deflected).length;
    const deflectionRate = totalTickets > 0 ? (deflectedTickets / totalTickets) * 100 : 0;

    // Category breakdown
    const categoryCounts = tickets.reduce((acc, ticket) => {
      const category = ticket.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count: count as number,
        percentage: ((count as number) / totalTickets) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sentiment breakdown
    const sentimentCounts = tickets.reduce((acc, ticket) => {
      const sentiment = ticket.sentiment || 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sentimentBreakdown = Object.entries(sentimentCounts)
      .map(([sentiment, count]) => ({
        sentiment,
        count: count as number,
        percentage: ((count as number) / totalTickets) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate average times
    const ticketsWithTimes = tickets.filter(t => t.resolution_time_minutes);
    const avgResolutionTime = ticketsWithTimes.length > 0 
      ? ticketsWithTimes.reduce((sum, t) => sum + (t.resolution_time_minutes || 0), 0) / ticketsWithTimes.length
      : 0;

    const ticketsWithResponseTimes = tickets.filter(t => t.response_time_minutes);
    const avgResponseTime = ticketsWithResponseTimes.length > 0
      ? ticketsWithResponseTimes.reduce((sum, t) => sum + (t.response_time_minutes || 0), 0) / ticketsWithResponseTimes.length
      : 0;

    return {
      totalTickets,
      deflectedTickets,
      deflectionRate,
      avgResponseTime,
      avgResolutionTime,
      topCategories,
      topIssues: [], // Would need keyword analysis for this
      sentimentBreakdown
    };
  }

  private generateMockAnalysis(ticket: unknown): TicketAnalysis {
    const categories = ['Account', 'Billing', 'Feature Request', 'Bug', 'How-to', 'Technical Issue'];
    const sentiments = ['positive', 'neutral', 'negative'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const deflectionPotentials = ['high', 'medium', 'low'];

    return {
      id: ticket.id,
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)] as any,
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)] as any,
      sentimentScore: Math.random() * 2 - 1,
      deflectionPotential: deflectionPotentials[Math.floor(Math.random() * deflectionPotentials.length)] as any,
      confidence: 0.7 + Math.random() * 0.3,
      keywords: ['support', 'help', 'issue'],
      intent: 'Get help with a problem',
      estimatedResolutionTime: 15 + Math.random() * 45,
      requiresHuman: Math.random() > 0.5,
      tags: ['support', 'customer']
    };
  }

  private generateMockDeflectionResponse(analysis: TicketAnalysis): DeflectionResponse {
    return {
      can_deflect: analysis.deflectionPotential === 'high',
      response_content: 'Thank you for reaching out! I can help you with that. Here\'s what you need to know...',
      confidence: 0.8,
      response_type: 'auto_resolve',
      reasoning: 'Mock response',
      suggested_actions: ['Send automated response'],
      follow_up_required: false,
      escalation_triggers: ['Customer requests escalation'],
      estimated_cost: 0,
      tokens_used: 0,
      model_used: 'mock',
      generated_at: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const ticketDeflectionEngine = new TicketDeflectionEngine(); 