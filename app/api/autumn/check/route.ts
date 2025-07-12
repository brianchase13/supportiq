import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTIQ_PLANS } from '@/lib/billing/autumn-config';

export async function POST(request: NextRequest) {
  try {
    const { customerId, feature, requestedQuantity } = await request.json();

    if (!customerId || !feature) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, feature' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll simulate usage limits based on a default plan
    // In production, this would check the customer's actual plan and usage from Autumn
    const mockCustomerPlan = 'GROWTH'; // Default to Growth plan for demo
    const plan = SUPPORTIQ_PLANS[mockCustomerPlan as keyof typeof SUPPORTIQ_PLANS];
    
    const featureLimit = plan.features[feature as keyof typeof plan.features]?.limit || 1000;
    const currentUsage = Math.floor(Math.random() * featureLimit * 0.7); // Simulate 70% usage
    const remaining = featureLimit - currentUsage;
    const requestedQty = requestedQuantity || 1;

    const result = {
      allowed: remaining >= requestedQty,
      remaining: Math.max(0, remaining),
      limit: featureLimit,
      currentUsage,
      feature,
      customerId
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json(
      { error: 'Failed to check usage limit' },
      { status: 500 }
    );
  }
}