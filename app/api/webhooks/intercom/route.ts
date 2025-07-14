import { NextRequest, NextResponse } from 'next/server';
import { createIntercomIntegration, IntercomWebhookEvent } from '@/lib/integrations/intercom';
import { supabaseAdmin } from '@/lib/supabase/client';
import crypto from 'crypto';
import { z } from 'zod';

const IntercomWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    item: z.object({
      id: z.string(),
      type: z.string(),
      metadata: z.record(z.any()).optional(),
    }).optional(),
    workspace_id: z.string().optional(),
  }).optional(),
  created_at: z.number().optional(),
});

// Webhook signature verification
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const webhookSecret = process.env.INTERCOM_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Parse and validate webhook payload
    const rawEvent = JSON.parse(body);
    const validationResult = IntercomWebhookSchema.safeParse(rawEvent);
    
    if (!validationResult.success) {
      console.error('Invalid webhook payload:', validationResult.error.issues);
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const event: IntercomWebhookEvent = validationResult.data as IntercomWebhookEvent;
    console.log('Received Intercom webhook event:', event.type);

    // Extract user ID from the event or metadata
    // This assumes you have a way to map Intercom workspace to your user
    // You might need to implement this based on your specific setup
    const userId = await getUserIdFromEvent(event);
    
    if (!userId) {
      console.error('Could not determine user ID from webhook event');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's Intercom access token
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('intercom_access_token')
      .eq('id', userId)
      .single();

    if (!user?.intercom_access_token) {
      console.error('No Intercom access token found for user:', userId);
      return NextResponse.json({ error: 'Intercom not configured' }, { status: 400 });
    }

    // Create Intercom integration and process event
    const intercom = createIntercomIntegration(user.intercom_access_token);
    await intercom.handleWebhookEvent(event, userId);

    // Log webhook processing
    await supabaseAdmin
      .from('webhook_logs')
      .insert({
        user_id: userId,
        provider: 'intercom',
        event_type: event.type,
        event_data: event,
        processed_at: new Date().toISOString(),
        status: 'success'
      });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Intercom webhook:', error);
    
    // Log error
    try {
      const body = await request.text();
      const event = JSON.parse(body);
      const userId = await getUserIdFromEvent(event);
      
      if (userId) {
        await supabaseAdmin
          .from('webhook_logs')
          .insert({
            user_id: userId,
            provider: 'intercom',
            event_type: event.type,
            event_data: event,
            processed_at: new Date().toISOString(),
            status: 'error',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });
      }
    } catch (logError) {
      console.error('Error logging webhook failure:', logError);
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Helper function to extract user ID from webhook event
async function getUserIdFromEvent(event: IntercomWebhookEvent): Promise<string | null> {
  try {
    // Method 1: Try to get user ID from event metadata
    if (event.data?.item?.metadata?.supportiq_user_id) {
      return event.data.item.metadata.supportiq_user_id;
    }

    // Method 2: Try to match by Intercom workspace ID
    if (event.data?.workspace_id) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('intercom_workspace_id', event.data.workspace_id)
        .single();
      
      return user?.id || null;
    }

    // Method 3: For demo/testing purposes, return a default user
    // In production, you'd want to implement proper user mapping
    if (process.env.NODE_ENV === 'development') {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(1)
        .single();
      
      return user?.id || null;
    }

    return null;
  } catch (error) {
    console.error('Error extracting user ID from event:', error);
    return null;
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