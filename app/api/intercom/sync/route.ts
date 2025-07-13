import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createIntercomIntegration } from '@/lib/integrations/intercom';

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Intercom configuration
    const { data: userConfig } = await supabase
      .from('users')
      .select('intercom_access_token')
      .eq('id', user.id)
      .single();

    if (!userConfig?.intercom_access_token) {
      return NextResponse.json(
        { error: 'Intercom not connected' },
        { status: 400 }
      );
    }

    const { full_sync = false, limit = 100, batch_size = 50, force = false } = await request.json();

    // Check if sync is already running (unless forced)
    if (!force) {
      const { data: activeSync } = await supabase
        .from('sync_logs')
        .select('id, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'started')
        .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
        .single();

      if (activeSync) {
        return NextResponse.json({ 
          error: 'Sync already in progress',
          sync_id: activeSync.id 
        }, { status: 409 });
      }
    }

    try {
      // Create Intercom integration
      const intercom = createIntercomIntegration(userConfig.intercom_access_token);

      // Start sync
      const startTime = new Date();
      
      // Log sync start
      const { data: syncLog } = await supabase
        .from('sync_logs')
        .insert({
          user_id: user.id,
          provider: 'intercom',
          action: 'sync',
          status: 'started',
          metadata: {
            full_sync,
            limit,
            batch_size,
            start_time: startTime.toISOString()
          },
          created_at: startTime.toISOString()
        })
        .select()
        .single();

      // Perform the sync with enhanced batch processing
      const syncResult = await intercom.syncConversationsWithBatching(
        user.id, 
        limit, 
        batch_size
      );

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Log sync completion
      await supabase
        .from('sync_logs')
        .update({
          status: 'completed',
          metadata: {
            ...syncLog?.metadata,
            end_time: endTime.toISOString(),
            duration_ms: duration,
            processed_count: syncResult.processed,
            success_count: syncResult.successful,
            error_count: syncResult.errors
          },
          updated_at: endTime.toISOString()
        })
        .eq('id', syncLog?.id);

      return NextResponse.json({
        success: true,
        sync_id: syncLog?.id,
        processed: syncResult.processed,
        successful: syncResult.successful,
        errors: syncResult.errors,
        duration_ms: duration,
        message: `Successfully synced ${syncResult.successful} conversations`
      });

    } catch (error) {
      console.error('Error during Intercom sync:', error);

      // Log sync error
      await supabase
        .from('sync_logs')
        .insert({
          user_id: user.id,
          provider: 'intercom',
          action: 'sync',
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          created_at: new Date().toISOString()
        });

      return NextResponse.json(
        { error: 'Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in sync endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to start sync' },
      { status: 500 }
    );
  }
}