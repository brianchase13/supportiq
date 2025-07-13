import { supabaseAdmin } from '@/lib/supabase/client';
import { ticketDeflectionEngine } from '@/lib/ai/ticket-deflection';
import { generateEmbedding } from '@/lib/ai/embeddings';

export interface IntercomTicket {
  id: string;
  type: 'conversation' | 'ticket';
  subject?: string;
  body: string;
  author: {
    id: string;
    type: 'user' | 'contact';
    email?: string;
    name?: string;
  };
  assignee?: {
    id: string;
    type: 'admin' | 'team';
  };
  status: 'open' | 'closed' | 'pending';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  created_at: number;
  updated_at: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface IntercomResponse {
  id: string;
  body: string;
  author: {
    id: string;
    type: 'admin' | 'team' | 'bot';
  };
  created_at: number;
}

export interface IntercomWebhookEvent {
  type: string;
  data: {
    item: IntercomTicket;
    [key: string]: any;
  };
  created_at: number;
}

export class IntercomIntegration {
  private accessToken: string;
  private baseUrl = 'https://api.intercom.io';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Handle incoming webhook events
  async handleWebhookEvent(event: IntercomWebhookEvent, userId: string): Promise<void> {
    try {
      console.log('Processing Intercom webhook event:', event.type);

      switch (event.type) {
        case 'conversation.user.created':
        case 'conversation.admin.replied':
        case 'conversation.user.replied':
          await this.processConversationEvent(event.data.item, userId);
          break;
        
        case 'ticket.created':
        case 'ticket.updated':
          await this.processTicketEvent(event.data.item, userId);
          break;
        
        default:
          console.log('Unhandled webhook event type:', event.type);
      }
    } catch (error) {
      console.error('Error processing Intercom webhook:', error);
      throw error;
    }
  }

  // Process conversation events
  private async processConversationEvent(conversation: IntercomTicket, userId: string): Promise<void> {
    // Check if this conversation already exists in our system
    const { data: existingTicket } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('intercom_id', conversation.id)
      .eq('user_id', userId)
      .single();

    if (existingTicket) {
      // Update existing ticket
      await this.updateTicket(existingTicket.id, conversation, userId);
    } else {
      // Create new ticket
      await this.createTicket(conversation, userId);
    }
  }

  // Process ticket events
  private async processTicketEvent(ticket: IntercomTicket, userId: string): Promise<void> {
    const { data: existingTicket } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('intercom_id', ticket.id)
      .eq('user_id', userId)
      .single();

    if (existingTicket) {
      await this.updateTicket(existingTicket.id, ticket, userId);
    } else {
      await this.createTicket(ticket, userId);
    }
  }

  // Create new ticket in our system
  private async createTicket(intercomTicket: IntercomTicket, userId: string): Promise<void> {
    try {
      // Generate embedding for similarity search
      const ticketText = `${intercomTicket.subject || ''} ${intercomTicket.body}`.trim();
      const embedding = await generateEmbedding(ticketText);

      // Get existing tickets for similarity analysis
      const { data: existingTickets } = await supabaseAdmin
        .from('tickets')
        .select('id, content, category, sentiment, embedding')
        .eq('user_id', userId)
        .not('category', 'is', null)
        .not('embedding', 'is', null)
        .limit(100);

      // Analyze ticket with AI
      const analysis = await ticketDeflectionEngine.analyzeTicket(
        {
          id: intercomTicket.id,
          subject: intercomTicket.subject,
          content: intercomTicket.body
        },
        existingTickets || []
      );

      // Generate deflection response
      const deflectionResponse = await ticketDeflectionEngine.generateDeflectionResponse(
        analysis,
        {
          id: intercomTicket.id,
          subject: intercomTicket.subject,
          content: intercomTicket.body
        }
      );

      // Create ticket record
      const { error: ticketError } = await supabaseAdmin
        .from('tickets')
        .insert({
          user_id: userId,
          intercom_id: intercomTicket.id,
          subject: intercomTicket.subject,
          content: intercomTicket.body,
          category: analysis.category,
          subcategory: analysis.subcategory,
          priority: analysis.priority,
          sentiment: analysis.sentiment,
          sentiment_score: analysis.sentimentScore,
          deflection_potential: analysis.deflectionPotential,
          confidence: analysis.confidence,
          keywords: analysis.keywords,
          intent: analysis.intent,
          estimated_resolution_time: analysis.estimatedResolutionTime,
          requires_human: analysis.requiresHuman,
          tags: analysis.tags,
          embedding: embedding,
          similar_tickets: analysis.similarTickets,
          deflected: deflectionResponse.canDeflect,
          deflection_response: deflectionResponse.response,
          deflection_confidence: deflectionResponse.confidence,
          status: intercomTicket.status,
          created_at: new Date(intercomTicket.created_at * 1000).toISOString(),
          updated_at: new Date(intercomTicket.updated_at * 1000).toISOString(),
          metadata: {
            intercom: {
              author: intercomTicket.author,
              assignee: intercomTicket.assignee,
              tags: intercomTicket.tags,
              metadata: intercomTicket.metadata
            }
          }
        });

      if (ticketError) {
        console.error('Failed to create ticket:', ticketError);
        return;
      }

      // If we can deflect, send automated response
      if (deflectionResponse.canDeflect) {
        await this.sendAutomatedResponse(intercomTicket.id, deflectionResponse, userId);
      }

      console.log(`Created ticket ${intercomTicket.id} with deflection: ${deflectionResponse.canDeflect}`);

    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  // Update existing ticket
  private async updateTicket(ticketId: string, intercomTicket: IntercomTicket, userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('tickets')
        .update({
          subject: intercomTicket.subject,
          content: intercomTicket.body,
          status: intercomTicket.status,
          updated_at: new Date(intercomTicket.updated_at * 1000).toISOString(),
          metadata: {
            intercom: {
              author: intercomTicket.author,
              assignee: intercomTicket.assignee,
              tags: intercomTicket.tags,
              metadata: intercomTicket.metadata
            }
          }
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Failed to update ticket:', error);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  // Send automated response to Intercom
  private async sendAutomatedResponse(
    conversationId: string, 
    deflectionResponse: any, 
    userId: string
  ): Promise<void> {
    try {
      // Send response to Intercom
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message_type: 'comment',
          body: deflectionResponse.response,
          admin_id: await this.getAdminId()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send response: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Save response record
      await supabaseAdmin
        .from('ticket_responses')
        .insert({
          ticket_id: conversationId,
          user_id: userId,
          intercom_response_id: responseData.id,
          response_type: 'automated',
          content: deflectionResponse.response,
          confidence: deflectionResponse.confidence,
          sent_at: new Date().toISOString(),
          metadata: {
            deflectionEngine: true,
            intercom: responseData
          }
        });

      // Update ticket with response sent
      await supabaseAdmin
        .from('tickets')
        .update({
          response_sent: true,
          response_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('intercom_id', conversationId);

      console.log(`Sent automated response to conversation ${conversationId}`);

    } catch (error) {
      console.error('Error sending automated response:', error);
      throw error;
    }
  }

  // Get admin ID for sending responses
  private async getAdminId(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/admins`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin info');
      }

      const data = await response.json();
      return data.admins[0]?.id || '';
    } catch (error) {
      console.error('Error fetching admin ID:', error);
      return '';
    }
  }

  // Sync existing conversations from Intercom
  async syncConversations(userId: string, limit: number = 100): Promise<void> {
    try {
      console.log('Starting Intercom conversation sync...');

      const response = await fetch(`${this.baseUrl}/conversations?per_page=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations from Intercom');
      }

      const data = await response.json();
      const conversations = data.conversations || [];

      console.log(`Found ${conversations.length} conversations to sync`);

      for (const conversation of conversations) {
        try {
          await this.processConversationEvent(conversation, userId);
        } catch (error) {
          console.error(`Error processing conversation ${conversation.id}:`, error);
        }
      }

      console.log('Intercom sync completed');

    } catch (error) {
      console.error('Error syncing Intercom conversations:', error);
      throw error;
    }
  }

  // Enhanced sync with batch processing and rate limiting
  async syncConversationsWithBatching(
    userId: string, 
    limit: number = 100, 
    batchSize: number = 50
  ): Promise<{ processed: number; successful: number; errors: number }> {
    try {
      console.log(`Starting enhanced Intercom sync: limit=${limit}, batchSize=${batchSize}`);

      let allConversations: IntercomTicket[] = [];
      let page = 1;
      const perPage = Math.min(50, batchSize); // Intercom API limit

      // Fetch all conversations with pagination
      while (allConversations.length < limit) {
        const response = await fetch(
          `${this.baseUrl}/conversations?per_page=${perPage}&page=${page}`, 
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch conversations page ${page}: ${response.statusText}`);
        }

        const data = await response.json();
        const conversations = data.conversations || [];

        if (conversations.length === 0) {
          break; // No more conversations
        }

        allConversations.push(...conversations);
        page++;

        // Rate limiting: wait between API calls
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Limit to requested amount
      allConversations = allConversations.slice(0, limit);
      console.log(`Found ${allConversations.length} conversations to sync`);

      // Process in batches
      let processed = 0;
      let successful = 0;
      let errors = 0;

      for (let i = 0; i < allConversations.length; i += batchSize) {
        const batch = allConversations.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allConversations.length / batchSize)}`);

        const batchResults = await Promise.allSettled(
          batch.map(conversation => this.processConversationEvent(conversation, userId))
        );

        batchResults.forEach((result, index) => {
          processed++;
          if (result.status === 'fulfilled') {
            successful++;
          } else {
            errors++;
            console.error(`Error processing conversation ${batch[index].id}:`, result.reason);
          }
        });

        // Rate limiting between batches
        if (i + batchSize < allConversations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Enhanced Intercom sync completed: ${successful} successful, ${errors} errors`);
      return { processed, successful, errors };

    } catch (error) {
      console.error('Error in enhanced Intercom sync:', error);
      throw error;
    }
  }

  // Get conversation details from Intercom
  async getConversation(conversationId: string): Promise<IntercomTicket | null> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  // Update conversation status in Intercom
  async updateConversationStatus(conversationId: string, status: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          state: status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update conversation status');
      }
    } catch (error) {
      console.error('Error updating conversation status:', error);
      throw error;
    }
  }

  // Assign conversation to admin
  async assignConversation(conversationId: string, adminId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message_type: 'assignment',
          admin_id: adminId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign conversation');
      }
    } catch (error) {
      console.error('Error assigning conversation:', error);
      throw error;
    }
  }
}

// Factory function to create Intercom integration
export function createIntercomIntegration(accessToken: string): IntercomIntegration {
  return new IntercomIntegration(accessToken);
} 