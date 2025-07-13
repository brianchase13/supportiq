import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { decrypt } from '@/lib/crypto/encryption';
import { syncLimiter, checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const SyncRequestSchema = z.object({
  force: z.boolean().optional().default(false),
  maxTickets: z.number().min(1).max(1000).optional().default(100),
});

interface IntercomConversation {
  id: string;
  title: string;
  state: 'open' | 'closed' | 'snoozed';
  priority: 'not_priority' | 'priority';
  created_at: number;
  updated_at: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
    type: 'admin' | 'team';
  };
  contacts?: {
    contacts: Array<{
      id: string;
      email: string;
      name?: string;
    }>;
  };
  conversation_parts?: {
    conversation_parts: Array<{
      id: string;
      part_type: 'comment' | 'note';
      body: string;
      created_at: number;
      author?: {
        id: string;
        name: string;
        email: string;
        type: 'admin' | 'user';
      };
    }>;
  };
  tags?: {
    tags: Array<{
      id: string;
      name: string;
    }>;
  };
  statistics?: {
    first_admin_reply?: {
      created_at: number;
    };
  };
}

export async function POST(request: NextRequest) {
  let syncLogId: string | null = null;
  
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const body = await request.json();
    const clientIP = request.ip || 'unknown';

    // Rate limiting
    const rateLimitResult = await checkRateLimit(syncLimiter, clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Sync rate limit exceeded. Please wait before retrying.',
          retryAfter: rateLimitResult.msBeforeNext 
        },
        { status: 429 }
      );
    }

    // Validate request
    const validationResult = SyncRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { force, maxTickets } = validationResult.data;

    // Get user and check subscription limits
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        subscription_plans(ticket_limit, features)
      `)
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userData.intercom_access_token) {
      return NextResponse.json({ error: 'Intercom not connected' }, { status: 400 });
    }

    // Check usage limits
    const ticketLimit = userData.subscription_plans?.ticket_limit || 100;
    if (userData.usage_current >= ticketLimit && !force) {
      return NextResponse.json({ 
        error: 'Usage limit exceeded',
        current: userData.usage_current,
        limit: ticketLimit,
        upgradeUrl: '/pricing'
      }, { status: 402 });
    }

    // Check if recent sync exists and is still valid (unless forced)
    if (!force) {
      const { data: recentSync } = await supabaseAdmin
        .from('sync_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('sync_type', 'tickets')
        .eq('status', 'success')
        .gte('started_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (recentSync) {
        return NextResponse.json({
          message: 'Recent sync already completed',
          syncLog: recentSync,
          cached: true
        });
      }
    }

    // Create sync log
    const { data: syncLog, error: syncLogError } = await supabaseAdmin
      .from('sync_logs')
      .insert({
        user_id: userId,
        sync_type: 'tickets',
        status: 'in_progress',
      })
      .select()
      .single();

    if (syncLogError || !syncLog) {
      console.error('Failed to create sync log:', syncLogError);
      return NextResponse.json({ error: 'Failed to start sync' }, { status: 500 });
    }

    syncLogId = syncLog.id;

    try {
      // Decrypt access token
      const accessToken = decrypt(userData.intercom_access_token);

      // Get last sync timestamp for incremental updates
      const { data: lastTicket } = await supabaseAdmin
        .from('tickets')
        .select('updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      const sinceTimestamp = lastTicket?.updated_at 
        ? Math.floor(new Date(lastTicket.updated_at).getTime() / 1000)
        : Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000); // 30 days default

      // Smart fetching - only get conversations updated since last sync
      const conversations = await fetchConversationsWithRetry(
        accessToken, 
        sinceTimestamp,
        maxTickets
      );

      if (conversations.length === 0) {
        await supabaseAdmin
          .from('sync_logs')
          .update({
            status: 'success',
            records_processed: 0,
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncLogId);

        return NextResponse.json({
          success: true,
          processed: 0,
          message: 'No new conversations to sync'
        });
      }

      // Process conversations into tickets
      const processedTickets = await Promise.all(
        conversations.map(conv => processConversation(conv, userId))
      );

      // Bulk upsert with conflict resolution
      const { error: insertError } = await supabaseAdmin
        .from('tickets')
        .upsert(
          processedTickets.filter(Boolean), 
          { 
            onConflict: 'id',
            ignoreDuplicates: false 
          }
        );

      if (insertError) {
        throw new Error(`Failed to insert tickets: ${insertError.message}`);
      }

      // Update usage tracking
      await supabaseAdmin.rpc('update_user_usage', {
        p_user_id: userId,
        p_operation_type: 'sync',
        p_tokens_used: 0,
        p_cost_usd: 0
      });

      // Update sync log with success
      await supabaseAdmin
        .from('sync_logs')
        .update({
          status: 'success',
          records_processed: processedTickets.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLogId);

      return NextResponse.json({
        success: true,
        processed: processedTickets.length,
        syncLogId,
        nextSyncRecommended: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });

    } catch (error) {
      // Update sync log with error
      if (syncLogId) {
        await supabaseAdmin
          .from('sync_logs')
          .update({
            status: 'error',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncLogId);
      }

      throw error;
    }

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Sync failed',
        syncLogId 
      },
      { status: 500 }
    );
  }
}

async function fetchConversationsWithRetry(
  accessToken: string, 
  sinceTimestamp: number,
  maxTickets: number
): Promise<IntercomConversation[]> {
  const maxRetries = 3;
  let delay = 1000; // Start with 1 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchConversations(accessToken, sinceTimestamp, maxTickets);
    } catch (error: any) {
      console.error(`Fetch attempt ${attempt + 1} failed:`, error);

      // Don't retry on authentication errors
      if (error.status === 401 || error.status === 403) {
        throw error;
      }

      // Don't retry on client errors (except rate limits)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      delay *= 2;
    }
  }

  throw new Error('Max retries exceeded');
}

async function fetchConversations(
  accessToken: string, 
  sinceTimestamp: number,
  maxTickets: number
): Promise<IntercomConversation[]> {
  const allConversations: IntercomConversation[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore && allConversations.length < maxTickets) {
    const searchBody = {
      query: {
        operator: 'AND',
        value: [
          {
            field: 'updated_at',
            operator: '>',
            value: sinceTimestamp,
          },
        ],
      },
      sort: {
        field: 'updated_at',
        order: 'descending',
      },
      pagination: {
        per_page: Math.min(50, maxTickets - allConversations.length),
        ...(startingAfter && { starting_after: startingAfter }),
      },
    };

    const response = await fetch('https://api.intercom.io/conversations/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'SupportIQ/1.0',
      },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      throw { 
        status: response.status, 
        message: `API error: ${response.statusText}`,
        response 
      };
    }

    const data = await response.json();
    allConversations.push(...(data.conversations || []));

    hasMore = data.pages?.next != null && allConversations.length < maxTickets;
    if (hasMore && data.conversations?.length > 0) {
      startingAfter = data.conversations[data.conversations.length - 1].id;
    }

    // Rate limiting protection
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return allConversations;
}

function processConversation(conversation: IntercomConversation, userId: string) {
  try {
    // Extract meaningful content from conversation parts
    const parts = conversation.conversation_parts?.conversation_parts || [];
    const content = parts
      .filter(part => part.part_type === 'comment')
      .map(part => part.body)
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
      tags: conversation.tags?.tags?.map(tag => tag.name) || [],
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