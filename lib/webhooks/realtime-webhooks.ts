import { createClient } from '@supabase/supabase-js';
import { TicketDeflectionEngine } from '@/lib/ai/ticket-deflection-engine';
import { ResponseTemplateSystem } from '@/lib/ai/response-templates';

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  source: 'intercom' | 'zendesk' | 'freshdesk' | 'custom';
  user_id: string;
  processed: boolean;
  created_at: string;
  processed_at?: string;
  error?: string;
}

interface TicketUpdate {
  id: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  assigned_to?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
  updated_at: string;
}

interface WebhookResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class RealtimeWebhookSystem {
  private supabase: any;
  private deflectionEngine: TicketDeflectionEngine;
  private templateSystem: ResponseTemplateSystem;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.deflectionEngine = new TicketDeflectionEngine();
    this.templateSystem = new ResponseTemplateSystem();
  }

  async processWebhookEvent(event: Omit<WebhookEvent, 'id' | 'created_at' | 'processed'>): Promise<WebhookResponse> {
    try {
      // Store the webhook event
      const webhookEvent = await this.storeWebhookEvent(event);

      // Process based on event type
      let result: WebhookResponse;

      switch (event.type) {
        case 'ticket.created':
          result = await this.handleTicketCreated(event.data, event.user_id);
          break;
        case 'ticket.updated':
          result = await this.handleTicketUpdated(event.data, event.user_id);
          break;
        case 'ticket.replied':
          result = await this.handleTicketReplied(event.data, event.user_id);
          break;
        case 'ticket.closed':
          result = await this.handleTicketClosed(event.data, event.user_id);
          break;
        case 'conversation.created':
          result = await this.handleConversationCreated(event.data, event.user_id);
          break;
        case 'conversation.replied':
          result = await this.handleConversationReplied(event.data, event.user_id);
          break;
        default:
          result = {
            success: false,
            message: `Unknown event type: ${event.type}`,
            error: 'UNKNOWN_EVENT_TYPE'
          };
      }

      // Update webhook event status
      await this.updateWebhookEventStatus(webhookEvent.id, result.success, result.error);

      return result;
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async storeWebhookEvent(event: Omit<WebhookEvent, 'id' | 'created_at' | 'processed'>): Promise<WebhookEvent> {
    const { data, error } = await this.supabase
      .from('webhook_events')
      .insert({
        ...event,
        id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        processed: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async updateWebhookEventStatus(eventId: string, success: boolean, error?: string): Promise<void> {
    await this.supabase
      .from('webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        error: error || null
      })
      .eq('id', eventId);
  }

  private async handleTicketCreated(ticketData: any, userId: string): Promise<WebhookResponse> {
    try {
      // Load user settings
      await this.deflectionEngine.loadUserSettings(userId);

      // Create ticket record
      const ticket = await this.createTicketRecord(ticketData, userId);

      // Analyze ticket for deflection
      const deflectionResult = await this.deflectionEngine.analyzeTicket(ticket);

      if (deflectionResult.shouldDeflect) {
        // Send automated response
        const responseSent = await this.deflectionEngine.sendIntercomResponse(
          ticket.id,
          deflectionResult.response,
          userId
        );

        if (responseSent) {
          // Update ticket status
          await this.updateTicketStatus(ticket.id, 'resolved', 'Auto-resolved by AI');

          // Log deflection
          await this.logDeflection(ticket.id, deflectionResult, userId);

          return {
            success: true,
            message: 'Ticket auto-resolved successfully',
            data: {
              ticket_id: ticket.id,
              deflection_result: deflectionResult,
              response_sent: true
            }
          };
        }
      }

      // If not deflected, assign to appropriate agent
      await this.assignTicketToAgent(ticket.id, userId);

      return {
        success: true,
        message: 'Ticket created and assigned to agent',
        data: {
          ticket_id: ticket.id,
          deflection_result: deflectionResult,
          response_sent: false
        }
      };
    } catch (error) {
      console.error('Error handling ticket created:', error);
      return {
        success: false,
        message: 'Failed to process ticket creation',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleTicketUpdated(ticketData: any, userId: string): Promise<WebhookResponse> {
    try {
      const ticketId = ticketData.id;
      
      // Update ticket record
      await this.updateTicketRecord(ticketId, ticketData);

      // Check if status changed to resolved
      if (ticketData.status === 'resolved' || ticketData.status === 'closed') {
        await this.handleTicketResolution(ticketId, userId);
      }

      return {
        success: true,
        message: 'Ticket updated successfully',
        data: { ticket_id: ticketId }
      };
    } catch (error) {
      console.error('Error handling ticket updated:', error);
      return {
        success: false,
        message: 'Failed to process ticket update',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleTicketReplied(ticketData: any, userId: string): Promise<WebhookResponse> {
    try {
      const ticketId = ticketData.id;
      const reply = ticketData.reply;

      // Store the reply
      await this.storeTicketReply(ticketId, reply, userId);

      // Check if this is a customer reply that needs attention
      if (reply.author_type === 'user') {
        await this.handleCustomerReply(ticketId, reply, userId);
      }

      return {
        success: true,
        message: 'Ticket reply processed successfully',
        data: { ticket_id: ticketId }
      };
    } catch (error) {
      console.error('Error handling ticket replied:', error);
      return {
        success: false,
        message: 'Failed to process ticket reply',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleTicketClosed(ticketData: any, userId: string): Promise<WebhookResponse> {
    try {
      const ticketId = ticketData.id;

      // Update ticket status
      await this.updateTicketStatus(ticketId, 'closed', 'Ticket closed');

      // Send satisfaction survey if enabled
      await this.sendSatisfactionSurvey(ticketId, userId);

      // Update analytics
      await this.updateTicketAnalytics(ticketId, userId);

      return {
        success: true,
        message: 'Ticket closed successfully',
        data: { ticket_id: ticketId }
      };
    } catch (error) {
      console.error('Error handling ticket closed:', error);
      return {
        success: false,
        message: 'Failed to process ticket closure',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleConversationCreated(conversationData: any, userId: string): Promise<WebhookResponse> {
    try {
      // Convert conversation to ticket format
      const ticketData = this.convertConversationToTicket(conversationData);
      
      // Handle as ticket creation
      return await this.handleTicketCreated(ticketData, userId);
    } catch (error) {
      console.error('Error handling conversation created:', error);
      return {
        success: false,
        message: 'Failed to process conversation creation',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleConversationReplied(conversationData: any, userId: string): Promise<WebhookResponse> {
    try {
      // Convert conversation reply to ticket reply format
      const replyData = this.convertConversationReplyToTicketReply(conversationData);
      
      // Handle as ticket reply
      return await this.handleTicketReplied(replyData, userId);
    } catch (error) {
      console.error('Error handling conversation replied:', error);
      return {
        success: false,
        message: 'Failed to process conversation reply',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createTicketRecord(ticketData: any, userId: string): Promise<any> {
    const ticket = {
      id: ticketData.id,
      user_id: userId,
      subject: ticketData.subject || ticketData.title,
      body: ticketData.body || ticketData.description,
      customer_email: ticketData.customer_email,
      priority: this.mapPriority(ticketData.priority),
      category: ticketData.category || 'general',
      tags: ticketData.tags || [],
      status: 'open',
      source: 'intercom',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async updateTicketRecord(ticketId: string, ticketData: any): Promise<void> {
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (ticketData.subject) updates.subject = ticketData.subject;
    if (ticketData.body) updates.body = ticketData.body;
    if (ticketData.priority) updates.priority = this.mapPriority(ticketData.priority);
    if (ticketData.category) updates.category = ticketData.category;
    if (ticketData.tags) updates.tags = ticketData.tags;
    if (ticketData.status) updates.status = ticketData.status;

    const { error } = await this.supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId);

    if (error) throw error;
  }

  private async updateTicketStatus(ticketId: string, status: string, notes?: string): Promise<void> {
    const { error } = await this.supabase
      .from('tickets')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) throw error;

    // Log status change
    if (notes) {
      await this.supabase
        .from('ticket_activity_logs')
        .insert({
          ticket_id: ticketId,
          action: 'status_change',
          details: notes,
          created_at: new Date().toISOString()
        });
    }
  }

  private async assignTicketToAgent(ticketId: string, userId: string): Promise<void> {
    // Get available agents
    const { data: agents } = await this.supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'agent')
      .eq('active', true);

    if (agents && agents.length > 0) {
      // Simple round-robin assignment
      const assignedAgent = agents[Math.floor(Math.random() * agents.length)];
      
      await this.supabase
        .from('tickets')
        .update({
          assigned_to: assignedAgent.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
    }
  }

  private async logDeflection(ticketId: string, deflectionResult: any, userId: string): Promise<void> {
    await this.supabase
      .from('deflection_logs')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        confidence: deflectionResult.confidence,
        response: deflectionResult.response,
        category: deflectionResult.category,
        estimated_savings: deflectionResult.estimatedSavings,
        created_at: new Date().toISOString()
      });
  }

  private async storeTicketReply(ticketId: string, reply: any, userId: string): Promise<void> {
    await this.supabase
      .from('ticket_replies')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        author_type: reply.author_type,
        author_email: reply.author_email,
        content: reply.content,
        created_at: new Date().toISOString()
      });
  }

  private async handleCustomerReply(ticketId: string, reply: any, userId: string): Promise<void> {
    // Check if this reply indicates the issue is resolved
    const resolvedKeywords = ['thanks', 'thank you', 'solved', 'resolved', 'working', 'fixed'];
    const isResolved = resolvedKeywords.some(keyword => 
      reply.content.toLowerCase().includes(keyword)
    );

    if (isResolved) {
      await this.updateTicketStatus(ticketId, 'resolved', 'Customer indicated resolution');
    } else {
      // Re-assign to agent if needed
      await this.assignTicketToAgent(ticketId, userId);
    }
  }

  private async handleTicketResolution(ticketId: string, userId: string): Promise<void> {
    // Update resolution time
    const { data: ticket } = await this.supabase
      .from('tickets')
      .select('created_at')
      .eq('id', ticketId)
      .single();

    if (ticket) {
      const resolutionTime = new Date().getTime() - new Date(ticket.created_at).getTime();
      const resolutionHours = resolutionTime / (1000 * 60 * 60);

      await this.supabase
        .from('tickets')
        .update({
          resolution_time_hours: resolutionHours,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
    }
  }

  private async sendSatisfactionSurvey(ticketId: string, userId: string): Promise<void> {
    // Get user settings to check if satisfaction surveys are enabled
    const { data: settings } = await this.supabase
      .from('user_settings')
      .select('satisfaction_surveys_enabled')
      .eq('user_id', userId)
      .single();

    if (settings?.satisfaction_surveys_enabled) {
      // Send satisfaction survey via Intercom
      // Implementation would depend on Intercom API
      console.log(`Sending satisfaction survey for ticket ${ticketId}`);
    }
  }

  private async updateTicketAnalytics(ticketId: string, userId: string): Promise<void> {
    // Update various analytics metrics
    // This would update dashboards, reports, etc.
    console.log(`Updating analytics for ticket ${ticketId}`);
  }

  private mapPriority(priority: any): 'low' | 'medium' | 'high' | 'urgent' {
    if (typeof priority === 'string') {
      const lower = priority.toLowerCase();
      if (['urgent', 'critical'].includes(lower)) return 'urgent';
      if (['high', 'important'].includes(lower)) return 'high';
      if (['medium', 'normal'].includes(lower)) return 'medium';
      if (['low', 'minor'].includes(lower)) return 'low';
    }
    return 'medium';
  }

  private convertConversationToTicket(conversationData: any): any {
    return {
      id: conversationData.id,
      subject: conversationData.subject || 'New conversation',
      body: conversationData.body || conversationData.message,
      customer_email: conversationData.customer_email,
      priority: 'medium',
      category: 'general',
      tags: [],
      created_at: conversationData.created_at
    };
  }

  private convertConversationReplyToTicketReply(conversationData: any): any {
    return {
      id: conversationData.conversation_id,
      reply: {
        author_type: conversationData.author_type,
        author_email: conversationData.author_email,
        content: conversationData.body || conversationData.message
      }
    };
  }

  async getWebhookStats(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events } = await this.supabase
        .from('webhook_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (!events) return null;

      const totalEvents = events.length;
      const processedEvents = events.filter(e => e.processed).length;
      const failedEvents = events.filter(e => e.error).length;

      const eventTypes = events.reduce((acc: any, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {});

      return {
        total_events: totalEvents,
        processed_events: processedEvents,
        failed_events: failedEvents,
        success_rate: totalEvents > 0 ? (processedEvents / totalEvents) * 100 : 0,
        event_types: eventTypes,
        avg_processing_time: 0.5 // Mock data - would calculate actual processing time
      };
    } catch (error) {
      console.error('Error getting webhook stats:', error);
      return null;
    }
  }

  async retryFailedWebhooks(userId: string): Promise<number> {
    try {
      const { data: failedEvents } = await this.supabase
        .from('webhook_events')
        .select('*')
        .eq('user_id', userId)
        .eq('processed', false)
        .not('error', 'is', null);

      if (!failedEvents) return 0;

      let retryCount = 0;
      for (const event of failedEvents) {
        try {
          const result = await this.processWebhookEvent({
            type: event.type,
            data: event.data,
            source: event.source,
            user_id: event.user_id
          });

          if (result.success) {
            retryCount++;
          }
        } catch (error) {
          console.error(`Failed to retry webhook event ${event.id}:`, error);
        }
      }

      return retryCount;
    } catch (error) {
      console.error('Error retrying failed webhooks:', error);
      return 0;
    }
  }
} 