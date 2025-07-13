import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: syncId } = await params;

    // Get the sync log to verify ownership and status
    const { data: syncLog, error: fetchError } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('id', syncId)
      .eq('user_id', user.id)
      .eq('provider', 'intercom')
      .single();

    if (fetchError || !syncLog) {
      return NextResponse.json({ error: 'Sync not found' }, { status: 404 });
    }

    // Check if sync is currently running
    if (syncLog.status !== 'started') {
      return NextResponse.json({ 
        error: 'Sync is not currently running',
        status: syncLog.status 
      }, { status: 400 });
    }

    // Update sync status to stopped
    const { error: updateError } = await supabase
      .from('sync_logs')
      .update({
        status: 'stopped',
        error_message: 'Sync stopped by user',
        updated_at: new Date().toISOString()
      })
      .eq('id', syncId);

    if (updateError) {
      console.error('Error stopping sync:', updateError);
      return NextResponse.json({ error: 'Failed to stop sync' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Sync stopped successfully',
      sync_id: syncId
    });

  } catch (error) {
    console.error('Error in stop sync endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to stop sync' },
      { status: 500 }
    );
  }
} 