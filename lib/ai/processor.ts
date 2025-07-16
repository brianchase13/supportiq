import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase/client';
import { TrialManager } from '@/lib/trial/manager';
import { APP_CONFIG } from '@/lib/config/constants';
import { logger } from '@/lib/logging/logger';
import { TicketData, KnowledgeBaseEntry, ResponseTemplate, ConversationHistory } from '@/lib/types';
import IntercomClient from '@/lib/intercom/client';

export interface TicketData {
  id: string;
  user_id: string;
  subject?: string;
  content: string;
  customer_email: string;
  category?: string;
  priority?: string;
  created_at: string;
  intercom_conversation_id?: string;
}

export interface AIResponse {
  response_content: string;
  response_type: 'auto_resolve' | 'follow_up' | 'escalate';
  confidence_score: number;
  reasoning: string;
  tokens_used: number;
  cost_usd: number;
  suggested_actions?: string[];
  follow_up_required?: boolean;
  escalation_triggers?: string[];
}

export interface ProcessingResult {
  success: boolean;
  should_respond: boolean;
  response?: AIResponse;
  reason: string;
  usage_tracked: boolean;
}

export class RealTicketProcessor {
  private openai: OpenAI;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Process a ticket with real AI analysis
   */
  async processTicket(ticket: TicketData): Promise<ProcessingResult> {
    try {
      // Check trial limits first
      const trialCheck = await TrialManager.checkTrialLimits(this.userId, 'ai_responses_used');
      if (!trialCheck.allowed) {
        return {
          success: false,
          should_respond: false,
          reason: `Trial limit exceeded. You've used ${trialCheck.used}/${trialCheck.limit} AI responses.`,
          usage_tracked: false
        };
      }

      // Pre-flight checks
      const preflightResult = this.preflightChecks(ticket);
      if (!preflightResult.shouldProcess) {
        return {
          success: true,
          should_respond: false,
          reason: preflightResult.reason,
          usage_tracked: false
        };
      }

      // Generate AI response
      const aiResponse = await this.generateResponse(ticket);

      // Track usage
      await TrialManager.trackUsage(this.userId, 'ai_responses_used', 1);

      // Determine if we should auto-respond based on confidence
      const shouldAutoRespond = this.shouldAutoResolve(aiResponse);

      if (shouldAutoRespond) {
        // Store response in database
        await this.storeAIResponse(ticket.id, aiResponse);
        
        // Send to Intercom if confidence is high enough
        if (aiResponse.confidence_score >= APP_CONFIG.AI.CONFIDENCE_THRESHOLD) {
          await this.sendResponse(ticket, aiResponse);
          await this.updateTicketStatus(ticket.id, 'auto_resolved');
        }

        return {
          success: true,
          should_respond: true,
          response: aiResponse,
          reason: 'High confidence AI response generated',
          usage_tracked: true
        };
      } else {
        // Store for escalation
        await this.storeAIResponse(ticket.id, {
          ...aiResponse,
          response_type: 'escalate',
        });

        return {
          success: true,
          should_respond: false,
          reason: `Low confidence (${Math.round(aiResponse.confidence_score * 100)}%) - escalating to human`,
          usage_tracked: true
        };
      }

    } catch (error) {
      await logger.error('Ticket processing error:', error);
      return {
        success: false,
        should_respond: false,
        reason: error instanceof Error ? error.message : 'Unknown processing error',
        usage_tracked: false
      };
    }
  }

  /**
   * Generate AI response using OpenAI
   */
  private async generateResponse(ticket: TicketData): Promise<AIResponse> {
    // Get relevant knowledge base articles
    const knowledgeBase = await this.getRelevantKnowledge(ticket);
    
    // Get response templates
    const templates = await this.getResponseTemplates(ticket.category);

    // Get user's conversation history for context
    const conversationHistory = await this.getConversationHistory(ticket.intercom_conversation_id);

    // Build prompt
    const prompt = this.buildPrompt(ticket, knowledgeBase, templates, conversationHistory);

    const startTime = Date.now();
    
    const completion = await this.openai.chat.completions.create({
      model: APP_CONFIG.AI.DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert customer support AI for SupportIQ. Your goal is to provide helpful, accurate responses that resolve customer issues.

Response Guidelines:
- Be empathetic and professional
- Provide specific, actionable solutions
- Include relevant links or resources when available
- Keep responses concise but complete
- Use the customer's language/tone appropriately
- Always include confidence score (0.0-1.0)
- Suggest escalation if the issue is complex or sensitive

Available response types:
- auto_resolve: High confidence, complete solution provided
- follow_up: Medium confidence, partial solution with follow-up needed
- escalate: Low confidence or complex issue requiring human intervention

Language: English
Custom Instructions: Focus on quick resolution while maintaining quality`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: APP_CONFIG.AI.TEMPERATURE,
      max_tokens: APP_CONFIG.AI.MAX_TOKENS,
      functions: [
        {
          name: 'generate_support_response',
          description: 'Generate a customer support response with confidence scoring',
          parameters: {
            type: 'object',
            properties: {
              response_content: {
                type: 'string',
                description: 'The actual response to send to the customer',
              },
              response_type: {
                type: 'string',
                enum: ['auto_resolve', 'follow_up', 'escalate'],
                description: 'Type of response based on confidence and complexity',
              },
              confidence_score: {
                type: 'number',
                minimum: 0.0,
                maximum: 1.0,
                description: 'Confidence score for this response (0.0-1.0)',
              },
              reasoning: {
                type: 'string',
                description: 'Why this response type and confidence score were chosen',
              },
              suggested_actions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Suggested next actions for the support team',
              },
              follow_up_required: {
                type: 'boolean',
                description: 'Whether follow-up is needed',
              },
              escalation_triggers: {
                type: 'array',
                items: { type: 'string' },
                description: 'Triggers that would require escalation',
              },
            },
            required: ['response_content', 'response_type', 'confidence_score', 'reasoning'],
          },
        },
      ],
      function_call: { name: 'generate_support_response' },
    });

    const endTime = Date.now();
    const tokensUsed = completion.usage?.total_tokens || 0;
    const costUsd = this.calculateCost(tokensUsed);

    const functionCall = completion.choices[0]?.message?.function_call;
    if (!functionCall || functionCall.name !== 'generate_support_response') {
      throw new Error('Invalid AI response format');
    }

    const responseData = JSON.parse(functionCall.arguments);

    return {
      response_content: responseData.response_content,
      response_type: responseData.response_type,
      confidence_score: responseData.confidence_score,
      reasoning: responseData.reasoning,
      tokens_used: tokensUsed,
      cost_usd: costUsd,
      suggested_actions: responseData.suggested_actions,
      follow_up_required: responseData.follow_up_required,
      escalation_triggers: responseData.escalation_triggers,
    };
  }

  /**
   * Pre-flight checks before processing
   */
  private preflightChecks(ticket: TicketData): { shouldProcess: boolean; reason: string } {
    if (!ticket.content || ticket.content.trim().length < 10) {
      return {
        shouldProcess: false,
        reason: 'Ticket content too short for meaningful analysis'
      };
    }

    if (ticket.content.length > 5000) {
      return {
        shouldProcess: false,
        reason: 'Ticket content too long, consider manual review'
      };
    }

    return { shouldProcess: true, reason: 'Checks passed' };
  }

  /**
   * Determine if we should auto-resolve based on confidence
   */
  private shouldAutoResolve(response: AIResponse): boolean {
    return response.confidence_score >= APP_CONFIG.AI.CONFIDENCE_THRESHOLD && 
           response.response_type === 'auto_resolve';
  }

  /**
   * Get relevant knowledge base articles
   */
  private async getRelevantKnowledge(ticket: TicketData): Promise<unknown[]> {
    const { data: articles } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('user_id', this.userId)
      .eq('status', 'active')
      .limit(5);

    return articles || [];
  }

  /**
   * Get response templates for category
   */
  private async getResponseTemplates(category?: string): Promise<unknown[]> {
    const { data: templates } = await supabaseAdmin
      .from('response_templates')
      .select('*')
      .eq('user_id', this.userId)
      .eq('category', category || 'general')
      .eq('status', 'active')
      .limit(3);

    return templates || [];
  }

  /**
   * Get conversation history for context
   */
  private async getConversationHistory(conversationId?: string): Promise<unknown[]> {
    if (!conversationId) return [];

    const { data: history } = await supabaseAdmin
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    return history || [];
  }

  /**
   * Build the prompt for AI analysis
   */
  private buildPrompt(ticket: TicketData, knowledgeBase: unknown[], templates: unknown[], history: unknown[]): string {
    let prompt = `Analyze this customer support ticket and generate an appropriate response:

TICKET:
Subject: ${ticket.subject || 'No subject'}
Content: ${ticket.content}
Customer: ${ticket.customer_email}
Category: ${ticket.category || 'Unknown'}
Priority: ${ticket.priority || 'Normal'}

KNOWLEDGE BASE ARTICLES:
${knowledgeBase.map(article => `- ${article.title}: ${article.content.substring(0, 200)}...`).join('\n')}

RESPONSE TEMPLATES:
${templates.map(template => `- ${template.name}: ${template.content.substring(0, 200)}...`).join('\n')}

CONVERSATION HISTORY:
${history.map(msg => `- ${msg.sender}: ${msg.content.substring(0, 100)}...`).join('\n')}

Generate a response that:
1. Addresses the customer's specific issue
2. Uses relevant knowledge base information
3. Follows appropriate response templates
4. Maintains conversation context
5. Provides clear next steps if needed`;

    return prompt;
  }

  /**
   * Calculate cost based on tokens used
   */
  private calculateCost(tokensUsed: number): number {
    // GPT-4o-mini pricing: $0.00015 per 1K input tokens, $0.0006 per 1K output tokens
    const inputTokens = Math.floor(tokensUsed * 0.7); // Estimate 70% input
    const outputTokens = tokensUsed - inputTokens;
    
    const inputCost = (inputTokens / 1000) * 0.00015;
    const outputCost = (outputTokens / 1000) * 0.0006;
    
    return inputCost + outputCost;
  }

  /**
   * Store AI response in database
   */
  private async storeAIResponse(ticketId: string, response: AIResponse): Promise<void> {
    const { error } = await supabaseAdmin
      .from('ai_responses')
      .insert({
        ticket_id: ticketId,
        user_id: this.userId,
        response_content: response.response_content,
        response_type: response.response_type,
        confidence_score: response.confidence_score,
        reasoning: response.reasoning,
        tokens_used: response.tokens_used,
        cost_usd: response.cost_usd,
        suggested_actions: response.suggested_actions,
        follow_up_required: response.follow_up_required,
        escalation_triggers: response.escalation_triggers,
        created_at: new Date().toISOString()
      });

    if (error) {
      await logger.error('Failed to store AI response:', error);
    }
  }

  /**
   * Send response to Intercom
   */
  private async sendResponse(ticket: TicketData, response: AIResponse): Promise<void> {
    if (!ticket.intercom_conversation_id) {
      await logger.info('No Intercom conversation ID, skipping response send');
      return;
    }

    try {
      // Get user's Intercom access token
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('intercom_access_token')
        .eq('id', this.userId)
        .single();

      if (!user?.intercom_access_token) {
        await logger.warn('No Intercom access token found for user', { userId: this.userId });
        return;
      }

      // Send response via Intercom API
      const intercomClient = new IntercomClient();
      await intercomClient.sendConversationReply(
        user.intercom_access_token,
        ticket.intercom_conversation_id,
        response.response_content,
        'comment'
      );

      await logger.info('Response sent to Intercom successfully', {
        conversation_id: ticket.intercom_conversation_id,
        response_length: response.response_content.length
      });
    } catch (error) {
      await logger.error('Failed to send response to Intercom:', error);
    }
  }

  /**
   * Update ticket status
   */
  private async updateTicketStatus(ticketId: string, status: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('tickets')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) {
      await logger.error('Failed to update ticket status:', error);
    }
  }
} 