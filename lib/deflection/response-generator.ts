import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase/client';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openai;
}

export interface ResponseGenerationRequest {
  ticketContent: string;
  ticketSubject?: string;
  customerEmail: string;
  category?: string;
  priority?: string;
  conversationHistory?: ConversationMessage[];
  language?: string;
  customInstructions?: string;
  userId: string;
}

export interface ConversationMessage {
  role: 'customer' | 'agent' | 'system';
  content: string;
  timestamp: string;
}

export interface GeneratedResponse {
  content: string;
  type: 'auto_resolve' | 'follow_up' | 'escalate';
  confidence: number;
  reasoning: string;
  suggestedActions?: string[];
  estimatedResolutionTime?: number;
  followUpNeeded?: boolean;
  escalationReason?: string;
}

export interface ResponseMetrics {
  tokensUsed: number;
  costUsd: number;
  responseTimeMs: number;
  modelUsed: string;
}

export class AIResponseGenerator {
  private userId: string;
  private language: string;
  private customInstructions?: string;

  constructor(userId: string, language: string = 'en', customInstructions?: string) {
    this.userId = userId;
    this.language = language;
    this.customInstructions = customInstructions;
  }

  async generateResponse(request: ResponseGenerationRequest): Promise<{
    response: GeneratedResponse;
    metrics: ResponseMetrics;
  }> {
    const startTime = Date.now();

    try {
      // Get contextual data
      const context = await this.gatherContext(request);
      
      // Build the prompt
      const prompt = this.buildPrompt(request, context);
      
      // Generate response using OpenAI
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        functions: [
          {
            name: 'generate_customer_response',
            description: 'Generate a comprehensive customer support response',
            parameters: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'The actual response content to send to the customer',
                },
                type: {
                  type: 'string',
                  enum: ['auto_resolve', 'follow_up', 'escalate'],
                  description: 'Response classification based on confidence and complexity',
                },
                confidence: {
                  type: 'number',
                  minimum: 0.0,
                  maximum: 1.0,
                  description: 'Confidence score for this response (0.0-1.0)',
                },
                reasoning: {
                  type: 'string',
                  description: 'Detailed explanation of the response type and confidence score',
                },
                suggestedActions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Optional list of suggested actions for the customer',
                },
                estimatedResolutionTime: {
                  type: 'number',
                  description: 'Estimated time in minutes to resolve this issue',
                },
                followUpNeeded: {
                  type: 'boolean',
                  description: 'Whether this issue requires follow-up',
                },
                escalationReason: {
                  type: 'string',
                  description: 'Reason for escalation if response type is escalate',
                },
              },
              required: ['content', 'type', 'confidence', 'reasoning'],
            },
          },
        ],
        function_call: { name: 'generate_customer_response' },
      });

      const endTime = Date.now();
      const tokensUsed = completion.usage?.total_tokens || 0;

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall || functionCall.name !== 'generate_customer_response') {
        throw new Error('Invalid AI response format');
      }

      const responseData = JSON.parse(functionCall.arguments);

      const response: GeneratedResponse = {
        content: responseData.content,
        type: responseData.type,
        confidence: responseData.confidence,
        reasoning: responseData.reasoning,
        suggestedActions: responseData.suggestedActions,
        estimatedResolutionTime: responseData.estimatedResolutionTime,
        followUpNeeded: responseData.followUpNeeded,
        escalationReason: responseData.escalationReason,
      };

      const metrics: ResponseMetrics = {
        tokensUsed,
        costUsd: this.calculateCost(tokensUsed),
        responseTimeMs: endTime - startTime,
        modelUsed: 'gpt-4o-mini',
      };

      return { response, metrics };

    } catch (error) {
      console.error('Response generation error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert customer support AI assistant for SupportIQ. Your primary goal is to provide helpful, accurate, and empathetic responses that resolve customer issues efficiently.

CORE PRINCIPLES:
1. Customer-first approach: Always prioritize the customer's needs and satisfaction
2. Accuracy over speed: Only provide information you're confident about
3. Empathy and professionalism: Maintain a warm, helpful tone
4. Escalation awareness: Know when human intervention is needed

RESPONSE GUIDELINES:
- Be concise but complete
- Use clear, non-technical language unless technical details are necessary
- Provide step-by-step instructions when appropriate
- Include relevant links, resources, or documentation references
- Acknowledge the customer's frustration if evident
- Set appropriate expectations for resolution

CONFIDENCE SCORING:
- 0.9-1.0: Extremely confident, standard issue with clear solution
- 0.7-0.89: High confidence, common issue with established solution
- 0.5-0.69: Medium confidence, requires follow-up or partial solution
- 0.3-0.49: Low confidence, complex issue requiring human review
- 0.0-0.29: Very low confidence, immediate escalation needed

RESPONSE TYPES:
- auto_resolve: Complete solution provided, high confidence (0.7+)
- follow_up: Partial solution, needs monitoring or additional info (0.4-0.69)
- escalate: Complex/sensitive issue requiring human intervention (0.0-0.39)

ESCALATION TRIGGERS:
- Security or privacy concerns
- Billing/payment disputes
- Account suspension/termination requests
- Complaints about staff/service
- Legal or compliance issues
- Technical issues requiring development team
- Requests for refunds or compensation
- Angry or threatening language

Language: ${this.language}
${this.customInstructions ? `\nCustom Instructions: ${this.customInstructions}` : ''}`;
  }

  private async gatherContext(request: ResponseGenerationRequest): Promise<{
    knowledgeBase: any[];
    templates: any[];
    similarTickets: any[];
    userHistory: any[];
  }> {
    try {
      const [knowledgeBase, templates, similarTickets, userHistory] = await Promise.all([
        this.getRelevantKnowledge(request.ticketContent, request.category),
        this.getResponseTemplates(request.category),
        this.getSimilarTickets(request.ticketContent),
        this.getUserHistory(request.customerEmail),
      ]);

      return {
        knowledgeBase,
        templates,
        similarTickets,
        userHistory,
      };
    } catch (error) {
      console.error('Context gathering error:', error);
      return {
        knowledgeBase: [],
        templates: [],
        similarTickets: [],
        userHistory: [],
      };
    }
  }

  private buildPrompt(request: ResponseGenerationRequest, context: any): string {
    const conversationHistory = request.conversationHistory || [];
    
    return `
CUSTOMER SUPPORT TICKET:

Subject: ${request.ticketSubject || 'No subject provided'}
Content: ${request.ticketContent}
Customer Email: ${request.customerEmail}
Category: ${request.category || 'Uncategorized'}
Priority: ${request.priority || 'Normal'}

CONVERSATION HISTORY:
${conversationHistory.length > 0 
  ? conversationHistory.map(msg => `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`).join('\n')
  : 'This is the first message in the conversation.'
}

CUSTOMER HISTORY:
${context.userHistory.length > 0
  ? context.userHistory.slice(0, 3).map((ticket: any) => `Previous Issue: ${ticket.subject || 'No subject'} (${ticket.status})`).join('\n')
  : 'No previous support history found.'
}

RELEVANT KNOWLEDGE BASE:
${context.knowledgeBase.length > 0
  ? context.knowledgeBase.map((kb: any) => `
Title: ${kb.title}
Content: ${kb.content}
Success Rate: ${Math.round((kb.success_rate || 0) * 100)}%
Usage Count: ${kb.usage_count || 0}
`).join('\n---\n')
  : 'No relevant knowledge base articles found.'
}

AVAILABLE TEMPLATES:
${context.templates.length > 0
  ? context.templates.map((template: any) => `
Template: ${template.name}
Category: ${template.category}
Content: ${template.template_content}
Success Rate: ${Math.round((template.success_rate || 0) * 100)}%
`).join('\n---\n')
  : 'No relevant response templates found.'
}

SIMILAR RESOLVED TICKETS:
${context.similarTickets.length > 0
  ? context.similarTickets.map((ticket: any) => `
Issue: ${ticket.subject || 'No subject'}
Resolution: ${ticket.resolution_summary || 'No resolution summary'}
Satisfaction: ${ticket.satisfaction_score || 'Unknown'}/5
`).join('\n---\n')
  : 'No similar resolved tickets found.'
}

TASK:
Please generate an appropriate response for this customer support ticket. Consider:

1. The customer's specific issue and tone
2. Any previous conversation context
3. Relevant knowledge base information
4. Customer's support history
5. Similar issues and their resolutions
6. Appropriate response templates

Provide a complete, helpful response with accurate confidence scoring and classification.

IMPORTANT REMINDERS:
- Only provide information you're confident about
- Use empathetic language if the customer seems frustrated
- Include specific steps or resources when possible
- Escalate if you're unsure or if the issue is sensitive
- Consider the customer's technical level
- Set realistic expectations for resolution
    `.trim();
  }

  private async getRelevantKnowledge(content: string, category?: string): Promise<any[]> {
    try {
      const keywords = this.extractKeywords(content);
      if (keywords.length === 0) return [];

      let query = supabaseAdmin
        .from('knowledge_base')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true);

      // Add keyword search
      const keywordConditions = keywords.map(keyword => 
        `title.ilike.%${keyword}%,content.ilike.%${keyword}%,tags.cs.{${keyword}}`
      ).join(',');

      query = query.or(keywordConditions);

      // Filter by category if provided
      if (category) {
        query = query.eq('category', category);
      }

      const { data: knowledge, error } = await query
        .order('success_rate', { ascending: false })
        .order('usage_count', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Knowledge base query error:', error);
        return [];
      }

      return knowledge || [];
    } catch (error) {
      console.error('Get relevant knowledge error:', error);
      return [];
    }
  }

  private async getResponseTemplates(category?: string): Promise<any[]> {
    try {
      let query = supabaseAdmin
        .from('response_templates')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data: templates, error } = await query
        .order('success_rate', { ascending: false })
        .order('usage_count', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Templates query error:', error);
        return [];
      }

      return templates || [];
    } catch (error) {
      console.error('Get response templates error:', error);
      return [];
    }
  }

  private async getSimilarTickets(content: string): Promise<any[]> {
    try {
      const keywords = this.extractKeywords(content);
      if (keywords.length === 0) return [];

      const keywordConditions = keywords.map(keyword => 
        `content.ilike.%${keyword}%,subject.ilike.%${keyword}%`
      ).join(',');

      const { data: tickets, error } = await supabaseAdmin
        .from('tickets')
        .select('*')
        .eq('user_id', this.userId)
        .eq('status', 'closed')
        .or(keywordConditions)
        .not('satisfaction_score', 'is', null)
        .gte('satisfaction_score', 4) // Only well-resolved tickets
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Similar tickets query error:', error);
        return [];
      }

      return tickets || [];
    } catch (error) {
      console.error('Get similar tickets error:', error);
      return [];
    }
  }

  private async getUserHistory(customerEmail: string): Promise<any[]> {
    try {
      const { data: tickets, error } = await supabaseAdmin
        .from('tickets')
        .select('*')
        .eq('user_id', this.userId)
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('User history query error:', error);
        return [];
      }

      return tickets || [];
    } catch (error) {
      console.error('Get user history error:', error);
      return [];
    }
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
      'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 
      'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 
      'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 
      'these', 'those', 'am', 'are', 'is', 'was', 'were', 'being', 'been', 'have', 
      'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'should', 
      'could', 'ought', 'might', 'must', 'can', 'may'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 15); // Limit to 15 most relevant keywords
  }

  private calculateCost(tokens: number): number {
    // GPT-4o-mini pricing: $0.00015 per 1K input tokens, $0.0006 per 1K output tokens
    // Using average cost for simplicity
    const avgCostPer1KTokens = 0.0003;
    return (tokens / 1000) * avgCostPer1KTokens;
  }

  async batchGenerateResponses(requests: ResponseGenerationRequest[]): Promise<Array<{
    response: GeneratedResponse;
    metrics: ResponseMetrics;
    error?: string;
  }>> {
    const results = await Promise.allSettled(
      requests.map(async (request) => {
        try {
          return await this.generateResponse(request);
        } catch (error) {
          return {
            response: null,
            metrics: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value.response) {
        return result.value;
      } else {
        return {
          response: null as any,
          metrics: null as any,
          error: result.status === 'rejected' ? result.reason : 'Generation failed',
        };
      }
    });
  }

  async analyzeTicketComplexity(content: string, subject?: string): Promise<{
    complexity: 'low' | 'medium' | 'high';
    estimatedTokens: number;
    suggestedModel: string;
    requiresHuman: boolean;
    reasoning: string;
  }> {
    const text = (content + ' ' + (subject || '')).toLowerCase();
    
    // Simple complexity analysis
    const complexityIndicators = {
      high: [
        'refund', 'billing', 'payment', 'charge', 'cancel', 'subscription',
        'delete', 'gdpr', 'privacy', 'legal', 'lawyer', 'sue', 'complaint',
        'angry', 'frustrated', 'terrible', 'awful', 'worst', 'hate',
        'bug', 'error', 'crash', 'broken', 'not working', 'issue',
        'technical', 'api', 'integration', 'development', 'code'
      ],
      medium: [
        'how to', 'setup', 'configure', 'settings', 'account', 'profile',
        'feature', 'function', 'help', 'support', 'question', 'explain'
      ],
      low: [
        'thank', 'thanks', 'hello', 'hi', 'greeting', 'welcome',
        'simple', 'quick', 'easy', 'basic'
      ]
    };

    let complexity: 'low' | 'medium' | 'high' = 'low';
    let reasoning = 'Simple inquiry or greeting';

    if (complexityIndicators.high.some(indicator => text.includes(indicator))) {
      complexity = 'high';
      reasoning = 'Contains billing, technical, or sensitive content requiring careful handling';
    } else if (complexityIndicators.medium.some(indicator => text.includes(indicator))) {
      complexity = 'medium';
      reasoning = 'Standard support question requiring detailed explanation';
    }

    const estimatedTokens = Math.max(200, text.length * 0.75); // Rough token estimation
    const suggestedModel = complexity === 'high' ? 'gpt-4' : 'gpt-4o-mini';
    const requiresHuman = complexity === 'high' && 
      (text.includes('refund') || text.includes('billing') || text.includes('legal'));

    return {
      complexity,
      estimatedTokens,
      suggestedModel,
      requiresHuman,
      reasoning,
    };
  }
}