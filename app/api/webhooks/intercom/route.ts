import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.INTERCOM_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify webhook signature for security
    if (WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (`sha256=${expectedSignature}` !== signature) {
        console.error('Webhook signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    // Handle different event types
    switch (type) {
      case 'conversation.created':
      case 'conversation.updated':
      case 'conversation.user.created':
      case 'conversation.user.replied':
      case 'conversation.admin.replied':
        await handleConversationEvent(type, data);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleConversationEvent(eventType: string, conversationData: any) {
  try {
    // Find user by workspace ID
    const workspaceId = conversationData.app?.id_code || conversationData.id_code;
    if (!workspaceId) {
      console.error('No workspace ID in webhook data');
      return;
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, intercom_access_token')
      .eq('intercom_workspace_id', workspaceId)
      .single();

    if (!user) {
      console.log(`No user found for workspace ID: ${workspaceId}`);
      return;
    }

    // Store webhook event for processing
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        user_id: user.id,
        event_type: eventType,
        intercom_event_id: conversationData.id,
        payload: conversationData,
        processed: false,
      });

    // For high-priority events, trigger immediate sync
    if (eventType === 'conversation.created' || eventType === 'conversation.user.replied') {
      await triggerRealTimeSync(user.id, conversationData.id);
    }

  } catch (error) {
    console.error('Error handling conversation event:', error);
  }
}

async function triggerRealTimeSync(userId: string, conversationId: string) {
  try {
    // Trigger async sync for this specific conversation
    // This would typically be done via a queue system in production
    fetch(`${process.env.NEXTAUTH_URL}/api/sync/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, conversationId }),
    }).catch(error => {
      console.error('Failed to trigger real-time sync:', error);
    });

  } catch (error) {
    console.error('Real-time sync trigger error:', error);
  }
}