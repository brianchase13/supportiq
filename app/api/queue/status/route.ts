import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deflectionProcessor } from '@/lib/queue/deflection-processor';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get queue statistics
    const stats = await deflectionProcessor.getQueueStats();

    // Get user's recent jobs
    const { data: userJobs, error } = await supabase
      .from('deflection_jobs')
      .select('id, status, priority, retry_count, created_at, completed_at, error_message')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching user jobs:', error);
    }

    return NextResponse.json({
      queue_stats: stats,
      user_jobs: userJobs || [],
      processing_status: 'active' // In a real deployment, you'd check if the processor is actually running
    });

  } catch (error) {
    console.error('Queue status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue status' },
      { status: 500 }
    );
  }
}

// Admin endpoint to trigger queue cleanup
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'cleanup') {
      await deflectionProcessor.cleanupOldJobs();
      return NextResponse.json({
        success: true,
        message: 'Queue cleanup initiated'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Queue action error:', error);
    return NextResponse.json(
      { error: 'Failed to process queue action' },
      { status: 500 }
    );
  }
}