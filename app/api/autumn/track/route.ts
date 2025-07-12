import { NextRequest, NextResponse } from 'next/server';
import { supportIQTracking } from '@/lib/billing/usage-tracking';

export async function POST(request: NextRequest) {
  try {
    const { customerId, event, quantity, metadata } = await request.json();

    if (!customerId || !event) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, event' },
        { status: 400 }
      );
    }

    // For now, we'll log the usage tracking
    // In production, this would integrate with Autumn's actual API
    console.log('Usage tracking:', {
      customerId,
      event,
      quantity: quantity || 1,
      metadata,
      timestamp: new Date().toISOString()
    });

    // Simulate successful tracking
    const result = {
      success: true,
      customerId,
      event,
      quantity: quantity || 1,
      metadata,
      trackedAt: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}