import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import IntercomClient from '@/lib/intercom/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature
    const intercomClient = new IntercomClient();
    const isValid = intercomClient.verifyWebhookSignature(body, signature.replace('sha256=', ''));
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const topic = request.headers.get('x-intercom-topic');
    
    console.log(`Received Intercom webhook: ${topic}`, { 
      id: payload.data?.id,
      type: payload.data?.type 
    });

    // Process different webhook topics
    switch (topic) {
      case 'conversation.user.created':
      case 'conversation.user.replied':
      case 'conversation.admin.replied':
      case 'conversation.admin.closed':
        await processConversationEvent(payload, topic);
        break;
        
      case 'ticket.created':
      case 'ticket.updated':
        await processTicketEvent(payload, topic);
        break;
        
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Intercom webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}

async function processConversationEvent(payload: any, topic: string) {
  const conversation = payload.data;
  
  if (!conversation?.id) {
    console.error('No conversation ID in payload');
    return;
  }

  // Transform conversation data for SupportIQ
  const conversationData = {
    id: conversation.id,
    type: 'conversation',
    status: conversation.state,
    created_at: new Date(conversation.created_at * 1000).toISOString(),
    updated_at: new Date(conversation.updated_at * 1000).toISOString(),
    user_id: conversation.user?.id,
    admin_id: conversation.assignee?.id,
    subject: conversation.conversation_message?.subject,
    body: conversation.conversation_message?.body,
    tags: conversation.tags?.map((tag: any) => tag.name) || [],
    priority: conversation.priority,
    webhook_topic: topic,
    // SupportIQ analytics fields
    deflection_score: calculateDeflectionScore(conversation),
    sentiment: analyzeSentiment(conversation.conversation_message?.body),
    category: categorizeConversation(conversation),
    // Metadata
    raw_data: conversation
  };

  // Store in conversations table
  const { error } = await supabaseAdmin
    .from('conversations')
    .upsert(conversationData, { 
      onConflict: 'id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('Error storing conversation:', error);
  } else {
    console.log(`Stored conversation ${conversation.id} from webhook ${topic}`);
  }

  // Update analytics
  await updateAnalytics('conversation', topic);
}

async function processTicketEvent(payload: any, topic: string) {
  const ticket = payload.data;
  
  if (!ticket?.id) {
    console.error('No ticket ID in payload');
    return;
  }

  // Transform ticket data for SupportIQ
  const ticketData = {
    id: ticket.id,
    type: 'ticket',
    status: ticket.state,
    created_at: new Date(ticket.created_at * 1000).toISOString(),
    updated_at: new Date(ticket.updated_at * 1000).toISOString(),
    user_id: ticket.user?.id,
    admin_id: ticket.assignee?.id,
    subject: ticket.ticket_attributes?.subject,
    body: ticket.ticket_attributes?.body,
    priority: ticket.ticket_attributes?.priority,
    webhook_topic: topic,
    // SupportIQ analytics fields
    deflection_score: calculateDeflectionScore(ticket),
    sentiment: analyzeSentiment(ticket.ticket_attributes?.body),
    category: categorizeTicket(ticket),
    // Metadata
    raw_data: ticket
  };

  // Store in tickets table
  const { error } = await supabaseAdmin
    .from('tickets')
    .upsert(ticketData, { 
      onConflict: 'id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('Error storing ticket:', error);
  } else {
    console.log(`Stored ticket ${ticket.id} from webhook ${topic}`);
  }

  // Update analytics
  await updateAnalytics('ticket', topic);
}

// SupportIQ Analytics Functions
function calculateDeflectionScore(item: any): number {
  let score = 0;
  
  if (item.tags?.some((tag: any) => tag.name?.toLowerCase().includes('faq'))) score += 0.3;
  if (item.tags?.some((tag: any) => tag.name?.toLowerCase().includes('documentation'))) score += 0.2;
  if (item.priority === 'low') score += 0.1;
  if (item.state === 'closed' && item.updated_at - item.created_at < 3600) score += 0.2;
  
  return Math.min(score, 1.0);
}

function analyzeSentiment(text?: string): string {
  if (!text) return 'neutral';
  
  const positiveWords = ['great', 'good', 'excellent', 'amazing', 'love', 'thanks', 'thank you'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'frustrated', 'angry', 'disappointed'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function categorizeConversation(conversation: any): string {
  const text = conversation.conversation_message?.body?.toLowerCase() || '';
  
  if (text.includes('password') || text.includes('login')) return 'authentication';
  if (text.includes('billing') || text.includes('payment')) return 'billing';
  if (text.includes('bug') || text.includes('error')) return 'technical';
  if (text.includes('feature') || text.includes('request')) return 'feature_request';
  
  return 'general';
}

function categorizeTicket(ticket: any): string {
  const text = ticket.ticket_attributes?.body?.toLowerCase() || '';
  
  if (text.includes('password') || text.includes('login')) return 'authentication';
  if (text.includes('billing') || text.includes('payment')) return 'billing';
  if (text.includes('bug') || text.includes('error')) return 'technical';
  if (text.includes('feature') || text.includes('request')) return 'feature_request';
  
  return 'general';
}

async function updateAnalytics(type: string, topic: string) {
  const now = new Date().toISOString();
  const dateKey = now.split('T')[0]; // YYYY-MM-DD format
  
  // Update real-time analytics
  const { error } = await supabaseAdmin
    .from('analytics_realtime')
    .upsert({
      date: dateKey,
      type: type,
      event: topic,
      count: 1,
      updated_at: now
    }, {
      onConflict: 'date,type,event',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Error updating analytics:', error);
  }
}

// Handle webhook verification (Intercom sends a GET request to verify the webhook)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const challenge = url.searchParams.get('hub.challenge');
  
  if (challenge) {
    console.log('Intercom webhook verification challenge:', challenge);
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ message: 'Intercom webhook endpoint' });
}