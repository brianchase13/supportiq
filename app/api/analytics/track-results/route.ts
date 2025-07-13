import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resultsTracker } from '@/lib/analytics/results-tracker';

// Track customer results in real-time
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, metrics, eventType } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate metrics data
    const validMetrics = validateMetrics(metrics);
    if (!validMetrics.isValid) {
      return NextResponse.json(
        { error: 'Invalid metrics data', details: validMetrics.errors },
        { status: 400 }
      );
    }

    // Track the results
    await resultsTracker.trackCustomerResults(userId, metrics);

    // Handle specific event types for additional tracking
    if (eventType) {
      await handleSpecificEvent(userId, eventType, metrics);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Results tracked successfully',
        userId 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error tracking customer results:', error);
    return NextResponse.json(
      { error: 'Failed to track results', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get customer results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'aggregate', 'topPerformers', 'testimonialCandidates'

    if (type === 'aggregate') {
      const metrics = await resultsTracker.getAggregateMetrics();
      return NextResponse.json({ metrics });
    }

    if (type === 'topPerformers') {
      const limit = parseInt(searchParams.get('limit') || '5');
      const performers = await resultsTracker.getTopPerformers(limit);
      return NextResponse.json({ performers });
    }

    if (type === 'testimonialCandidates') {
      const candidates = await resultsTracker.identifyTestimonialCandidates();
      return NextResponse.json({ candidates });
    }

    if (userId) {
      // Get specific user results
      const results = await getUserResults(userId);
      return NextResponse.json({ results });
    }

    // Get all results
    const allResults = await resultsTracker.getAllResults();
    return NextResponse.json({ results: allResults });

  } catch (error) {
    console.error('Error getting customer results:', error);
    return NextResponse.json(
      { error: 'Failed to get results', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Update customer feedback
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, feedback } = body;

    if (!userId || !feedback) {
      return NextResponse.json(
        { error: 'User ID and feedback are required' },
        { status: 400 }
      );
    }

    await resultsTracker.updateCustomerFeedback(userId, feedback);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback updated successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating customer feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Validate metrics data
function validateMetrics(metrics: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!metrics || typeof metrics !== 'object') {
    errors.push('Metrics must be an object');
    return { isValid: false, errors };
  }

  // Check for required numeric fields
  const numericFields = [
    'totalTickets', 'deflectedTickets', 'avgResponseTimeBefore', 
    'avgResponseTimeAfter', 'costPerTicket', 'satisfactionBefore', 
    'satisfactionAfter'
  ];

  numericFields.forEach(field => {
    if (metrics[field] !== undefined && (typeof metrics[field] !== 'number' || isNaN(metrics[field]))) {
      errors.push(`${field} must be a valid number`);
    }
  });

  // Validate ranges
  if (metrics.deflectionRate !== undefined && (metrics.deflectionRate < 0 || metrics.deflectionRate > 100)) {
    errors.push('Deflection rate must be between 0 and 100');
  }

  if (metrics.satisfactionBefore !== undefined && (metrics.satisfactionBefore < 1 || metrics.satisfactionBefore > 5)) {
    errors.push('Satisfaction scores must be between 1 and 5');
  }

  if (metrics.satisfactionAfter !== undefined && (metrics.satisfactionAfter < 1 || metrics.satisfactionAfter > 5)) {
    errors.push('Satisfaction scores must be between 1 and 5');
  }

  return { isValid: errors.length === 0, errors };
}

// Handle specific tracking events
async function handleSpecificEvent(userId: string, eventType: string, metrics: any): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (eventType) {
      case 'ticket_deflected':
        // Track ticket deflection event
        await supabase
          .from('deflection_events')
          .insert({
            user_id: userId,
            event_type: 'deflection',
            ticket_id: metrics.ticketId,
            confidence_score: metrics.confidenceScore || 0.8,
            deflection_reason: metrics.deflectionReason || 'ai_response',
            customer_satisfied: metrics.customerSatisfied || null,
            created_at: new Date().toISOString()
          });
        break;

      case 'satisfaction_improved':
        // Track satisfaction improvement
        await supabase
          .from('satisfaction_events')
          .insert({
            user_id: userId,
            event_type: 'satisfaction_update',
            old_score: metrics.oldScore,
            new_score: metrics.newScore,
            improvement: metrics.newScore - metrics.oldScore,
            feedback_text: metrics.feedbackText || null,
            created_at: new Date().toISOString()
          });
        break;

      case 'cost_savings_achieved':
        // Track cost savings milestone
        await supabase
          .from('savings_events')
          .insert({
            user_id: userId,
            event_type: 'savings_milestone',
            milestone_amount: metrics.milestoneAmount,
            total_savings: metrics.totalSavings,
            timeframe_days: metrics.timeframeDays || 30,
            created_at: new Date().toISOString()
          });
        break;

      case 'first_value_achieved':
        // Track time to first value
        await supabase
          .from('value_events')
          .insert({
            user_id: userId,
            event_type: 'first_value',
            days_to_value: metrics.daysToValue,
            value_type: metrics.valueType || 'first_deflection',
            value_metric: metrics.valueMetric || 'deflection_rate',
            value_threshold: metrics.valueThreshold || 10,
            created_at: new Date().toISOString()
          });
        break;

      default:
        console.log(`Unknown event type: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error handling ${eventType} event:`, error);
  }
}

// Get user-specific results
async function getUserResults(userId: string): Promise<any> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data, error } = await supabase
      .from('customer_results')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user results:', error);
    return null;
  }
}

// Example tracking calls:
/*
// Track a ticket deflection
POST /api/analytics/track-results
{
  "userId": "user_123",
  "eventType": "ticket_deflected",
  "metrics": {
    "totalTickets": 150,
    "deflectedTickets": 102,
    "ticketId": "ticket_456",
    "confidenceScore": 0.89,
    "deflectionReason": "ai_response",
    "customerSatisfied": true
  }
}

// Track satisfaction improvement
POST /api/analytics/track-results
{
  "userId": "user_123",
  "eventType": "satisfaction_improved",
  "metrics": {
    "satisfactionBefore": 3.2,
    "satisfactionAfter": 4.1,
    "oldScore": 3.2,
    "newScore": 4.1,
    "feedbackText": "Much faster responses now!"
  }
}

// Track cost savings milestone
POST /api/analytics/track-results
{
  "userId": "user_123",
  "eventType": "cost_savings_achieved",
  "metrics": {
    "milestoneAmount": 5000,
    "totalSavings": 5000,
    "timeframeDays": 30,
    "costPerTicket": 15
  }
}
*/