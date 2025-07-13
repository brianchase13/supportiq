import { NextRequest, NextResponse } from 'next/server';
import { TrialManager } from '@/lib/trial/manager';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Starting trial expiration check...');

    // Check for expired trials
    await TrialManager.checkTrialExpiration();

    console.log('✅ Trial expiration check completed');

    return NextResponse.json({
      success: true,
      message: 'Trial expiration check completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Trial expiration check failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Trial expiration check failed' },
      { status: 500 }
    );
  }
} 