import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { TicketDeflectionEngine, TicketData } from '@/lib/deflection/engine';
import { deflectionProcessor } from '@/lib/queue/deflection-processor';
import crypto from 'crypto';

interface IntercomWebhookEvent {
  type: string;
  id: string;
  topic: string;
  app_id: string;
  data: {
    type: string;
    id: string;
    [key: string]: any;
  };
  delivery_attempts?: number;
  delivery_status?: string;
  first_sent_at?: number;
  created_at?: number;
}

interface ConversationData {
  id: string;
  type: string;
  source: {
    type: string;
    id: string;
    delivered_as: string;
    subject?: string;
    body?: string;
    url?: string;
  };
  contacts: Array<{
    type: string;
    id: string;
    email?: string;
    name?: string;
  }>;
  conversation_parts: {
    conversation_parts: Array<{
      id: string;
      part_type: string;
      body?: string;
      created_at: number;
      author: {
        type: string;
        id: string;
        email?: string;
      };
    }>;
  };
  state: string;
  priority: string;
  tags: {
    type: string;
    tags: Array<{
      id: string;
      name: string;
    }>;
  };
  custom_attributes: Record<string, any>;
  created_at: number;
  updated_at: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify webhook signature
    if (!verifyIntercomSignature(body, signature)) {
      console.error('Invalid Intercom webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookEvent: IntercomWebhookEvent = JSON.parse(body);

    // Only process conversation events that might need deflection
    if (!shouldProcessEvent(webhookEvent)) {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    console.log('Processing Intercom webhook event:', webhookEvent.topic);

    // Process the conversation for deflection
    const result = await processConversationForDeflection(webhookEvent);

    // Log webhook processing
    await logWebhookEvent(webhookEvent, result.success, result.message);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        deflection_result: result.deflectionResult,
      });
    } else {
      console.error('Webhook processing failed:', result.message);
      return NextResponse.json({
        success: false,
        message: result.message,
      }, { status: 200 }); // Return 200 to prevent Intercom retries
    }

  } catch (error) {
    console.error('Webhook error:', error);
    
    // Log the error but return 200 to prevent retries
    await logWebhookError(error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal processing error',
    }, { status: 200 });
  }
}

function verifyIntercomSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.INTERCOM_CLIENT_SECRET) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.INTERCOM_CLIENT_SECRET)
      .update(body)
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

function shouldProcessEvent(event: IntercomWebhookEvent): boolean {
  // Process conversation creation and updates that might be new customer inquiries
  const processableTopics = [
    'conversation.user.created',
    'conversation.user.replied',
    'conversation.admin.replied',
  ];

  return processableTopics.includes(event.topic);
}

function determinePriority(conversationData: ConversationData, event: IntercomWebhookEvent): 'high' | 'normal' | 'low' {
  // High priority conditions
  if (conversationData.priority === 'priority') {
    return 'high';
  }

  // Check for urgent keywords in the conversation
  const urgentKeywords = ['urgent', 'emergency', 'critical', 'down', 'broken', 'not working'];
  const conversationText = (conversationData.source?.body || '').toLowerCase();
  
  if (urgentKeywords.some(keyword => conversationText.includes(keyword))) {
    return 'high';
  }

  // New conversations from user.created events get normal priority
  if (event.topic === 'conversation.user.created') {
    return 'normal';
  }

  // Default to low priority for other events
  return 'low';
}

async function processConversationForDeflection(event: IntercomWebhookEvent): Promise<{
  success: boolean;
  message: string;
  deflectionResult?: any;
}> {
  try {
    const conversationId = event.data.id;

    // Get full conversation data from Intercom API
    const conversationData = await fetchConversationFromIntercom(conversationId);
    
    if (!conversationData) {
      return {
        success: false,
        message: 'Failed to fetch conversation data from Intercom',
      };
    }

    // Find the user this conversation belongs to in our system
    const userId = await findUserByIntercomWorkspace(event.app_id);
    
    if (!userId) {
      return {
        success: false,
        message: `No user found for Intercom app_id: ${event.app_id}`,
      };
    }

    // Check if this conversation should be deflected
    if (!shouldAttemptDeflection(conversationData)) {
      return {
        success: true,
        message: 'Conversation does not qualify for deflection',
      };
    }

    // Convert Intercom conversation to our ticket format
    const ticketData = convertToTicketData(conversationData, userId);

    // Store or update ticket in our database
    await upsertTicket(ticketData);

    // Check user's deflection settings to determine if we should queue this
    const { data: settings } = await supabaseAdmin
      .from('deflection_settings')
      .select('auto_response_enabled')
      .eq('user_id', userId)
      .single();

    if (!settings?.auto_response_enabled) {
      return {
        success: true,
        message: 'Auto-response disabled for this user',
      };
    }

    // Determine priority based on conversation urgency
    const priority = determinePriority(conversationData, event);

    // Queue the deflection job for background processing
    const jobId = await deflectionProcessor.enqueueDeflection(
      userId,
      ticketData,
      event,
      priority
    );

    return {
      success: true,
      message: `Deflection job queued successfully (${jobId})`,
      deflectionResult: { 
        queued: true, 
        jobId, 
        priority,
        expectedProcessingTime: priority === 'high' ? '< 30 seconds' : '< 2 minutes'
      },
    };

  } catch (error) {
    console.error('Conversation processing error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown processing error',
    };
  }
}

async function fetchConversationFromIntercom(conversationId: string): Promise<ConversationData | null> {
  try {
    // This would make an actual API call to Intercom
    // For now, return mock data structure
    console.log('Fetching conversation from Intercom:', conversationId);
    
    // In a real implementation, you would:
    // const response = await fetch(`https://api.intercom.io/conversations/${conversationId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${intercomAccessToken}`,
    //     'Accept': 'application/json',
    //   },
    // });
    // const conversationData = await response.json();
    // return conversationData;

    return null; // Placeholder
  } catch (error) {
    console.error('Failed to fetch conversation from Intercom:', error);
    return null;
  }
}

async function findUserByIntercomWorkspace(appId: string): Promise<string | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('intercom_workspace_id', appId)
      .single();

    if (error || !user) {
      console.error('User not found for Intercom app_id:', appId);
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('Failed to find user by Intercom workspace:', error);
    return null;
  }
}

function shouldAttemptDeflection(conversation: ConversationData): boolean {
  // Don't deflect if conversation is already closed
  if (conversation.state === 'closed') {
    return false;
  }

  // Don't deflect if it's already been assigned to an admin
  if (conversation.conversation_parts?.conversation_parts?.some(
    part => part.author.type === 'admin'
  )) {
    return false;
  }

  // Don't deflect high priority conversations immediately
  if (conversation.priority === 'priority') {
    return false;
  }

  // Check for escalation tags
  const escalationTags = ['vip', 'urgent', 'escalate', 'human'];
  const conversationTags = conversation.tags?.tags?.map(tag => tag.name.toLowerCase()) || [];
  
  if (escalationTags.some(tag => conversationTags.includes(tag))) {
    return false;
  }

  return true;
}

function convertToTicketData(conversation: ConversationData, userId: string): TicketData {
  // Get the latest message from customer
  const customerParts = conversation.conversation_parts?.conversation_parts?.filter(
    part => part.author.type === 'user'
  ) || [];

  const latestCustomerMessage = customerParts[customerParts.length - 1];
  const content = latestCustomerMessage?.body || conversation.source?.body || '';
  
  // Extract customer email
  const customerContact = conversation.contacts?.find(contact => contact.email);
  const customerEmail = customerContact?.email || 'unknown@example.com';

  // Determine category from tags or custom attributes
  const category = determineCategory(conversation);

  return {
    id: conversation.id,
    user_id: userId,
    intercom_conversation_id: conversation.id,
    content: stripHtmlTags(content),
    subject: conversation.source?.subject,
    customer_email: customerEmail,
    category,
    priority: conversation.priority,
    created_at: new Date(conversation.created_at * 1000).toISOString(),
  };
}

function determineCategory(conversation: ConversationData): string | undefined {
  // Check tags first
  const tags = conversation.tags?.tags?.map(tag => tag.name.toLowerCase()) || [];
  
  // Map common tags to categories
  const categoryMap: Record<string, string> = {
    'billing': 'billing',
    'payment': 'billing',
    'technical': 'technical',
    'bug': 'technical',
    'feature': 'feature_request',
    'general': 'general',
    'support': 'general',
    'question': 'general',
  };

  for (const tag of tags) {
    if (categoryMap[tag]) {
      return categoryMap[tag];
    }
  }

  // Check custom attributes
  const category = conversation.custom_attributes?.category;
  if (category) {
    return category;
  }

  // Default category
  return 'general';
}

function stripHtmlTags(html: string): string {
  // Simple HTML tag removal
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

async function upsertTicket(ticketData: TicketData): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('tickets')
      .upsert({
        id: ticketData.id,
        user_id: ticketData.user_id,
        intercom_conversation_id: ticketData.intercom_conversation_id,
        content: ticketData.content,
        subject: ticketData.subject,
        category: ticketData.category,
        customer_email: ticketData.customer_email,
        priority: ticketData.priority,
        status: 'open',
        created_at: ticketData.created_at,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Failed to upsert ticket:', error);
      throw new Error('Failed to store ticket data');
    }
  } catch (error) {
    console.error('Ticket upsert error:', error);
    throw error;
  }
}

async function sendResponseToIntercom(conversationId: string, responseContent: string): Promise<void> {
  try {
    // This would make an actual API call to Intercom to send the response
    console.log('Sending response to Intercom conversation:', conversationId);
    console.log('Response content:', responseContent);

    // In a real implementation:
    // const response = await fetch(`https://api.intercom.io/conversations/${conversationId}/reply`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${intercomAccessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     message_type: 'comment',
    //     type: 'admin',
    //     body: responseContent,
    //   }),
    // });

    // Mark as sent in our database
    await supabaseAdmin
      .from('ai_responses')
      .update({
        sent_to_intercom: true,
        intercom_message_id: `reply_${Date.now()}`, // Placeholder
      })
      .eq('ticket_id', conversationId);

  } catch (error) {
    console.error('Failed to send response to Intercom:', error);
    throw error;
  }
}

async function logWebhookEvent(
  event: IntercomWebhookEvent,
  success: boolean,
  message: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from('webhook_logs')
      .insert({
        source: 'intercom',
        event_type: event.topic,
        event_id: event.id,
        app_id: event.app_id,
        payload: event,
        processed_successfully: success,
        processing_message: message,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

async function logWebhookError(error: any): Promise<void> {
  try {
    await supabaseAdmin
      .from('webhook_logs')
      .insert({
        source: 'intercom',
        event_type: 'error',
        processed_successfully: false,
        processing_message: error instanceof Error ? error.message : 'Unknown error',
        error_details: error instanceof Error ? error.stack : String(error),
        created_at: new Date().toISOString(),
      });
  } catch (logError) {
    console.error('Failed to log webhook error:', logError);
  }
}

// GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  // Intercom webhook verification
  const url = new URL(request.url);
  const hubChallenge = url.searchParams.get('hub.challenge');
  
  if (hubChallenge) {
    return NextResponse.json({ 'hub.challenge': hubChallenge });
  }

  return NextResponse.json({
    message: 'Intercom deflection webhook endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}