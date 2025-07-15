import OpenAI from 'openai';
import { z } from 'zod';
import { 
  Ticket, 
  AIAnalysisResult, 
  DeflectionResponse, 
  TicketCategory, 
  TicketPriority, 
  TicketSentiment,
  DeflectionPotential 
} from '@/lib/types';
import { getConfig } from '@/lib/config/constants';
import { log } from '@/lib/logging/logger';
import { generateEmbedding, findSimilarTickets } from './embeddings';
import { supabaseAdmin } from '@/lib/supabase/client';

// Input validation schemas
const TicketAnalysisSchema = z.object({
  category: z.enum(['Account', 'Billing', 'Feature Request', 'Bug', 'How-to', 'Technical Issue', 'Other']),
  subcategory: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  sentiment_score: z.number().min(-1).max(1),
  deflection_potential: z.enum(['high', 'medium', 'low']),
  confidence: z.number().min(0).max(1),
  keywords: z.array(z.string()),
  intent: z.string(),
  estimated_resolution_time: z.number().positive(),
  requires_human: z.boolean(),
  tags: z.array(z.string()),
});

export class TicketDeflectionEngine {
  private openai: OpenAI | null;
  private config = getConfig();

  constructor() {
    this.openai = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  async analyzeTicket(ticket: Ticket, existingTickets: Ticket[] = []): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    
    try {
      log.info('Starting ticket analysis', {
        ticket_id: ticket.id,
        user_id: ticket.user_id,
        subject_length: ticket.subject.length,
        content_length: ticket.content.length,
      });

      if (!this.openai) {
        throw new Error('OpenAI API key not configured');
      }

      // Generate embedding for similarity search
      const ticketText = `${ticket.subject} ${ticket.content}`.trim();
      const embedding = await generateEmbedding(ticketText);

      // Find similar tickets
      const similarTickets = findSimilarTickets(
        embedding,
        existingTickets.map(t => ({
          id: t.id,
          embedding: (t as any).embedding || [],
          category: t.category,
          content: t.content
        })),
        0.8,
        5
      );

      // Map similarTickets back to Ticket objects
      const similarTicketIds = similarTickets.map(t => t.ticketId);
      const similarTicketObjs = existingTickets.filter(t => similarTicketIds.includes(t.id));
      const analysis = await this.performAIAnalysis(ticket, similarTicketObjs);

      // Validate analysis result
      const validatedAnalysis = TicketAnalysisSchema.parse(analysis);

      // Calculate costs
      const tokensUsed = this.estimateTokensUsed(ticketText, analysis);
      const costUsd = this.calculateCost(tokensUsed);

      const result: AIAnalysisResult = {
        ...validatedAnalysis,
        similar_tickets: similarTickets.map(t => t.ticketId),
        model_used: this.config.AI.DEFAULT_MODEL,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        analysis_timestamp: new Date().toISOString(),
      };

      const duration = Date.now() - startTime;
      log.info('Ticket analysis completed', {
        ticket_id: ticket.id,
        duration_ms: duration,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        confidence: result.confidence,
        deflection_potential: result.deflection_potential,
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      log.error('Ticket analysis failed', error as Error, {
        ticket_id: ticket.id,
        user_id: ticket.user_id,
        duration_ms: duration,
      });
      throw error;
    }
  }

  private async performAIAnalysis(ticket: Ticket, similarTickets: Ticket[]): Promise<Partial<AIAnalysisResult>> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = this.buildAnalysisPrompt(ticket, similarTickets);

    const completion = await this.openai.chat.completions.create({
      model: this.config.AI.DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert customer support analyst. Analyze support tickets and provide accurate categorization and deflection assessment.

RESPONSE FORMAT: Return ONLY a valid JSON object with these exact fields:
{
  "category": "Account|Billing|Feature Request|Bug|How-to|Technical Issue|Other",
  "subcategory": "specific subcategory",
  "priority": "low|medium|high|urgent",
  "sentiment": "positive|neutral|negative",
  "sentiment_score": -1.0 to 1.0,
  "deflection_potential": "high|medium|low",
  "confidence": 0.0 to 1.0,
  "keywords": ["keyword1", "keyword2"],
  "intent": "what the user is trying to accomplish",
  "estimated_resolution_time": minutes,
  "requires_human": true/false,
  "tags": ["tag1", "tag2"]
}

ANALYSIS GUIDELINES:
- High deflection potential: FAQ questions, password resets, billing inquiries
- Medium deflection potential: Feature requests, basic how-to questions
- Low deflection potential: Complex bugs, account security issues
- Requires human: Complex issues, sensitive topics, escalations
- Confidence: Base on clarity of request and available information`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: this.config.AI.TEMPERATURE,
      max_tokens: this.config.AI.MAX_TOKENS,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    try {
      return JSON.parse(response);
    } catch (error) {
      log.error('Failed to parse AI response', error as Error, {
        response,
        ticket_id: ticket.id,
      });
      throw new Error('Invalid AI response format');
    }
  }

  private buildAnalysisPrompt(ticket: Ticket, similarTickets: Ticket[]): string {
    const similarTicketsContext = similarTickets.length > 0 
      ? `\nSIMILAR TICKETS (for context):\n${similarTickets.map((t, i) => 
          `${i + 1}. ${t.subject}: ${t.content.substring(0, 200)}...`
        ).join('\n')}`
      : '';

    return `Analyze this customer support ticket:

TICKET:
Subject: ${ticket.subject}
Content: ${ticket.content}
Customer Email: ${ticket.customer_email}
Created: ${ticket.created_at}${similarTicketsContext}

Provide analysis in the exact JSON format specified.`;
  }

  async generateDeflectionResponse(analysis: AIAnalysisResult, ticket: Ticket): Promise<DeflectionResponse> {
    const startTime = Date.now();

    try {
      log.info('Generating deflection response', {
        ticket_id: ticket.id,
        user_id: ticket.user_id,
        deflection_potential: analysis.deflection_potential,
        confidence: analysis.confidence,
      });

      // Check if we can deflect based on analysis and user settings
      const canDeflect = await this.canDeflectTicket(analysis, ticket);

      if (!canDeflect) {
        return this.generateEscalationResponse(analysis, ticket);
      }

      // Generate automated response
      const response = await this.generateAutomatedResponse(analysis, ticket);

      const duration = Date.now() - startTime;
      log.info('Deflection response generated', {
        ticket_id: ticket.id,
        duration_ms: duration,
        can_deflect: true,
        confidence: response.confidence,
      });

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      log.error('Failed to generate deflection response', error as Error, {
        ticket_id: ticket.id,
        user_id: ticket.user_id,
        duration_ms: duration,
      });
      throw error;
    }
  }

  private async canDeflectTicket(analysis: AIAnalysisResult, ticket: Ticket): Promise<boolean> {
    // Get user's deflection settings
    const { data: userSettings } = await supabaseAdmin
      .from('user_settings')
      .select('deflection_settings')
      .eq('user_id', ticket.user_id)
      .single();

    if (!userSettings?.deflection_settings?.auto_response_enabled) {
      return false;
    }

    const settings = userSettings.deflection_settings;

    // Check confidence threshold
    if (analysis.confidence < settings.confidence_threshold) {
      return false;
    }

    // Check if category is excluded
    if (settings.excluded_categories.includes(analysis.category)) {
      return false;
    }

    // Check if keywords are excluded
    const hasExcludedKeywords = settings.excluded_keywords.some((keyword: string) =>
      ticket.content.toLowerCase().includes(keyword.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasExcludedKeywords) {
      return false;
    }

    // Check working hours
    if (settings.working_hours.enabled && !this.isWithinWorkingHours(settings.working_hours)) {
      return false;
    }

    return analysis.deflection_potential === 'high' && !analysis.requires_human;
  }

  private async generateAutomatedResponse(analysis: AIAnalysisResult, ticket: Ticket): Promise<DeflectionResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = this.buildResponsePrompt(analysis, ticket);

    const completion = await this.openai.chat.completions.create({
      model: this.config.AI.DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful customer support agent. Generate personalized, helpful responses that solve customer issues efficiently.

RESPONSE GUIDELINES:
- Be empathetic and professional
- Provide specific, actionable steps
- Include relevant links or resources when available
- Keep responses concise but complete
- Use the customer's language/tone appropriately
- Always offer to escalate if needed

RESPONSE FORMAT: Return ONLY a valid JSON object:
{
  "response_content": "the actual response to send to the customer",
  "confidence": 0.0 to 1.0,
  "response_type": "auto_resolve|follow_up|escalate",
  "reasoning": "why this response was chosen",
  "suggested_actions": ["action1", "action2"],
  "follow_up_required": true/false,
  "escalation_triggers": ["trigger1", "trigger2"]
}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsedResponse = JSON.parse(response);
      const tokensUsed = this.estimateTokensUsed(prompt, parsedResponse);
      const costUsd = this.calculateCost(tokensUsed);

      return {
        can_deflect: true,
        response_content: parsedResponse.response_content,
        confidence: parsedResponse.confidence,
        response_type: parsedResponse.response_type,
        reasoning: parsedResponse.reasoning,
        suggested_actions: parsedResponse.suggested_actions,
        follow_up_required: parsedResponse.follow_up_required,
        escalation_triggers: parsedResponse.escalation_triggers,
        estimated_cost: costUsd,
        tokens_used: tokensUsed,
        model_used: this.config.AI.DEFAULT_MODEL,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      log.error('Failed to parse response generation', error as Error, {
        response,
        ticket_id: ticket.id,
      });
      throw new Error('Invalid response generation format');
    }
  }

  private buildResponsePrompt(analysis: AIAnalysisResult, ticket: Ticket): string {
    return `Generate a helpful response for this customer support ticket:

TICKET ANALYSIS:
- Category: ${analysis.category}
- Intent: ${analysis.intent}
- Keywords: ${analysis.keywords.join(', ')}
- Sentiment: ${analysis.sentiment}
- Deflection Potential: ${analysis.deflection_potential}

TICKET CONTENT:
Subject: ${ticket.subject}
Content: ${ticket.content}

Generate a response that addresses the specific question/issue and provides clear, actionable steps.`;
  }

  private generateEscalationResponse(analysis: AIAnalysisResult, ticket: Ticket): DeflectionResponse {
    return {
      can_deflect: false,
      response_content: `Thank you for reaching out! I understand your ${analysis.category.toLowerCase()} issue and want to make sure you get the best possible help.

I'm going to escalate this to one of our support specialists who can provide you with personalized assistance. You should receive a response within the next few hours.

In the meantime, if you have any additional details about your issue, please feel free to share them. This will help our team assist you more quickly.

Thank you for your patience!`,
      confidence: 0.9,
      response_type: 'escalate',
      reasoning: `Ticket requires human intervention: ${analysis.deflection_potential} deflection potential, requires_human: ${analysis.requires_human}`,
      suggested_actions: ['Escalate to human agent'],
      follow_up_required: true,
      escalation_triggers: ['Complex issue', 'Requires human intervention'],
      estimated_cost: 0,
      tokens_used: 0,
      model_used: 'escalation',
      generated_at: new Date().toISOString(),
    };
  }

  private isWithinWorkingHours(workingHours: any): boolean {
    if (!workingHours.enabled) return true;

    const now = new Date();
    const timezone = workingHours.timezone || 'UTC';
    const currentTime = now.toLocaleTimeString('en-US', { 
      timeZone: timezone, 
      hour12: false 
    });
    
    const currentDay = now.getDay();
    const isWorkingDay = workingHours.days_of_week.includes(currentDay);
    
    if (!isWorkingDay) return false;

    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const [startHour, startMinute] = workingHours.start_time.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end_time.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  private estimateTokensUsed(text: string, response?: Record<string, unknown>): number {
    // Rough estimation: 1 token ≈ 4 characters
    const inputTokens = Math.ceil(text.length / 4);
    const outputTokens = response ? Math.ceil(JSON.stringify(response).length / 4) : 0;
    return inputTokens + outputTokens;
  }

  private calculateCost(tokensUsed: number): number {
    // GPT-4o-mini pricing: $0.00015 per 1K input tokens, $0.0006 per 1K output tokens
    const inputCost = (tokensUsed * 0.75) * 0.00015 / 1000; // Assume 75% input tokens
    const outputCost = (tokensUsed * 0.25) * 0.0006 / 1000; // Assume 25% output tokens
    return inputCost + outputCost;
  }
}

// Export singleton instance
export const ticketDeflectionEngine = new TicketDeflectionEngine(); 