import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the most recent sync log
    const { data: latestSync, error: syncError } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'intercom')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (syncError && syncError.code !== 'PGRST116') {
      console.error('Error fetching sync status:', syncError);
      return NextResponse.json({ error: 'Failed to fetch sync status' }, { status: 500 });
    }

    if (!latestSync) {
      return NextResponse.json({
        status: 'idle',
        progress: 0,
        processed: 0,
        total: 0,
        errors: 0
      });
    }

    // Calculate progress based on metadata
    const metadata = latestSync.metadata || {};
    const processed = metadata.processed_count || 0;
    const total = metadata.limit || 0;
    const errors = metadata.error_count || 0;
    const progress = total > 0 ? Math.round((processed / total) * 100) : 0;

    // Determine status
    let status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
    switch (latestSync.status) {
      case 'started':
        status = 'running';
        break;
      case 'completed':
        status = 'completed';
        break;
      case 'error':
        status = 'failed';
        break;
      default:
        status = 'idle';
    }

    return NextResponse.json({
      id: latestSync.id,
      status,
      progress,
      processed,
      total,
      errors,
      startTime: metadata.start_time,
      endTime: metadata.end_time,
      errorMessage: latestSync.error_message,
      duration: metadata.duration_ms
    });

  } catch (error) {
    console.error('Error in sync status endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
} 