import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { IntercomConversation } from '@/lib/supabase/types';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's Intercom access token
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('intercom_access_token, intercom_workspace_id')
      .eq('id', userId)
      .single();

    if (userError || !user?.intercom_access_token) {
      return NextResponse.json({ error: 'Intercom not connected' }, { status: 400 });
    }

    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await supabaseAdmin
      .from('sync_logs')
      .insert({
        user_id: userId,
        sync_type: 'tickets',
        status: 'in_progress',
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('Failed to create sync log:', syncLogError);
      return NextResponse.json({ error: 'Failed to start sync' }, { status: 500 });
    }

    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);

      let allConversations: IntercomConversation[] = [];
      let hasMore = true;
      let startingAfter: string | undefined;

      // Fetch conversations from Intercom (paginated)
      while (hasMore) {
        const url = new URL('https://api.intercom.io/conversations/search');
        
        const searchBody = {
          query: {
            operator: 'AND',
            value: [
              {
                field: 'created_at',
                operator: '>',
                value: thirtyDaysAgo,
              },
            ],
          },
          sort: {
            field: 'created_at',
            order: 'descending',
          },
          pagination: {
            per_page: 50,
            ...(startingAfter && { starting_after: startingAfter }),
          },
        };

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.intercom_access_token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch conversations: ${response.statusText}`);
        }

        const data = await response.json();
        allConversations = [...allConversations, ...data.conversations];

        hasMore = data.pages?.next != null;
        if (hasMore && data.conversations.length > 0) {
          startingAfter = data.conversations[data.conversations.length - 1].id;
        }
      }

      // Process and store conversations
      const processedTickets = await Promise.all(
        allConversations.map(async (conversation) => {
          // Extract conversation content
          const parts = conversation.conversation_parts?.conversation_parts || [];
          const content = parts
            .filter(part => part.part_type === 'comment')
            .map(part => part.body)
            .join('\n\n');

          // Calculate response time
          let responseTimeMinutes: number | undefined;
          if (conversation.statistics?.first_admin_reply?.created_at && conversation.created_at) {
            const responseTimeMs = (conversation.statistics.first_admin_reply.created_at * 1000) - (conversation.created_at * 1000);
            responseTimeMinutes = Math.round(responseTimeMs / (1000 * 60));
          }

          // Get customer email
          const customerEmail = conversation.contacts?.contacts?.[0]?.email;

          // Get tags
          const tags = conversation.tags?.tags?.map(tag => tag.name) || [];

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
            customer_email: customerEmail,
            tags,
            response_time_minutes: responseTimeMinutes,
            created_at: new Date(conversation.created_at * 1000).toISOString(),
            updated_at: new Date(conversation.updated_at * 1000).toISOString(),
          };
        })
      );

      // Bulk insert tickets (upsert to handle duplicates)
      const { error: insertError } = await supabaseAdmin
        .from('tickets')
        .upsert(processedTickets, { onConflict: 'id' });

      if (insertError) {
        throw new Error(`Failed to insert tickets: ${insertError.message}`);
      }

      // Update sync log with success
      await supabaseAdmin
        .from('sync_logs')
        .update({
          status: 'success',
          records_processed: processedTickets.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);

      return NextResponse.json({
        success: true,
        processed: processedTickets.length,
        syncLogId: syncLog.id,
      });

    } catch (error) {
      // Update sync log with error
      await supabaseAdmin
        .from('sync_logs')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);

      throw error;
    }

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}