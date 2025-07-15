import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { decrypt } from '@/lib/crypto/encryption';
import { syncLimiter, checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const ConversationSyncRequestSchema = z.object({
  conversationId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const body = await request.json();
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Rate limiting
    const rateLimitResult = await syncLimiter.checkLimit(`conv_${clientIP}`, 'sync_conversation');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // Validate request
    const validationResult = ConversationSyncRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { conversationId } = validationResult.data;

    // Get user and access token
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, intercom_access_token')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userData.intercom_access_token) {
      return NextResponse.json({ error: 'Intercom not connected' }, { status: 400 });
    }

    try {
      // Decrypt access token
      const accessToken = decrypt(userData.intercom_access_token);

      // Fetch specific conversation from Intercom
      const conversation = await fetchSingleConversation(accessToken, conversationId);
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      // Process and upsert the conversation
      const processedTicket = processConversation(conversation, userId);
      
      if (processedTicket) {
        const { error: insertError } = await supabaseAdmin
          .from('tickets')
          .upsert(processedTicket, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (insertError) {
          throw new Error(`Failed to upsert conversation: ${insertError.message}`);
        }

        return NextResponse.json({
          success: true,
          conversationId,
          ticketId: processedTicket.id,
          processed: true
        });
      } else {
        return NextResponse.json({
          success: true,
          conversationId,
          processed: false,
          message: 'Conversation could not be processed'
        });
      }

    } catch (error) {
      console.error('Conversation sync error:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Conversation sync failed',
          conversationId 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process conversation sync request' },
      { status: 500 }
    );
  }
}

async function fetchSingleConversation(accessToken: string, conversationId: string) {
  try {
    const response = await fetch(`https://api.intercom.io/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'SupportIQ/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Conversation not found
      }
      throw new Error(`Intercom API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch conversation:', error);
    throw error;
  }
}

function processConversation(conversation: any, userId: string) {
  try {
    // Extract meaningful content from conversation parts
    const parts = conversation.conversation_parts?.conversation_parts || [];
    const content = parts
      .filter((part: any) => part.part_type === 'comment')
      .map((part: any) => part.body)
      .join('\n\n')
      .substring(0, 10000); // Limit content size

    // Calculate response time
    let responseTimeMinutes: number | undefined;
    if (conversation.statistics?.first_admin_reply?.created_at && conversation.created_at) {
      const responseTimeMs = (conversation.statistics.first_admin_reply.created_at * 1000) - (conversation.created_at * 1000);
      responseTimeMinutes = Math.round(responseTimeMs / (1000 * 60));
    }

    return {
      id: `intercom_${conversation.id}`,
      user_id: userId,
      intercom_conversation_id: conversation.id,
      content: content || '',
      subject: conversation.title || 'No subject',
      status: conversation.state,
      priority: conversation.priority,
      assignee_type: conversation.assignee?.type || 'admin',
      agent_name: conversation.assignee?.name,
      agent_email: conversation.assignee?.email,
      customer_email: conversation.contacts?.contacts?.[0]?.email,
      tags: conversation.tags?.tags?.map((tag: any) => tag.name) || [],
      response_time_minutes: responseTimeMinutes,
      created_at: new Date(conversation.created_at * 1000).toISOString(),
      updated_at: new Date(conversation.updated_at * 1000).toISOString(),
      synced_at: new Date().toISOString(),
      cached_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Cache for 24 hours
    };
  } catch (error) {
    console.error('Error processing conversation:', conversation.id, error);
    return null;
  }
}