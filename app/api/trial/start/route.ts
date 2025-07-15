import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TrialManager } from '@/lib/trial/manager';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an active trial
    const existingTrial = await TrialManager.getTrialStatus(user.id);
    if (existingTrial && existingTrial.status === 'active') {
      return NextResponse.json({
        error: 'User already has an active trial',
        trial: existingTrial
      }, { status: 400 });
    }

    // Start new trial
    const trial = await TrialManager.startTrial(user.id);

    return NextResponse.json({
      success: true,
      trial,
      message: 'Trial started successfully'
    });

  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start trial' },
      { status: 500 }
    );
  }
} 