import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TicketDeflectionEngine } from '@/lib/deflection/engine';
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const FeedbackRequestSchema = z.object({
  ticket_id: z.string(),
  ai_response_id: z.string().optional(),
  customer_satisfied: z.boolean(),
  customer_feedback: z.string().optional(),
  satisfaction_score: z.number().min(1).max(5).optional(),
  resolution_status: z.enum(['resolved', 'partially_resolved', 'not_resolved']).optional(),
  follow_up_needed: z.boolean().optional(),
  agent_notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await auth.getUser();
    const userId = user?.id;
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await apiLimiter.checkLimit(clientIP, 'deflection_feedback');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = FeedbackRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      ticket_id,
      ai_response_id,
      customer_satisfied,
      customer_feedback,
      satisfaction_score,
      resolution_status,
      follow_up_needed,
      agent_notes,
    } = validationResult.data;

    // Verify ticket belongs to user
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', ticket_id)
      .eq('user_id', userId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Get AI response if provided
    let aiResponse = null;
    if (ai_response_id) {
      const { data: response, error: responseError } = await supabaseAdmin
        .from('ai_responses')
        .select('*')
        .eq('id', ai_response_id)
        .eq('user_id', userId)
        .single();

      if (responseError || !response) {
        return NextResponse.json({ error: 'AI response not found' }, { status: 404 });
      }
      aiResponse = response;
    } else {
      // Try to find the most recent AI response for this ticket
      const { data: response } = await supabaseAdmin
        .from('ai_responses')
        .select('*')
        .eq('ticket_id', ticket_id)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      aiResponse = response;
    }

    // Store feedback in AI responses table if we have an AI response
    if (aiResponse) {
      const { error: updateError } = await supabaseAdmin
        .from('ai_responses')
        .update({
          customer_satisfied,
          customer_feedback,
        })
        .eq('id', aiResponse.id)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Failed to update AI response with feedback:', updateError);
      }

      // Use the deflection engine to learn from this feedback
      const settings = await TicketDeflectionEngine.getUserSettings(userId);
      const engine = new TicketDeflectionEngine(userId, settings);
      await engine.learnFromFeedback(ticket_id, customer_satisfied, customer_feedback);
    }

    // Store comprehensive feedback in feedback logs
    const { data: feedbackLog, error: feedbackError } = await supabaseAdmin
      .from('feedback_logs')
      .insert({
        user_id: userId,
        ticket_id,
        ai_response_id: aiResponse?.id,
        customer_satisfied,
        customer_feedback,
        satisfaction_score,
        resolution_status,
        follow_up_needed,
        agent_notes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('Failed to store feedback log:', feedbackError);
      return NextResponse.json(
        { error: 'Failed to store feedback' },
        { status: 500 }
      );
    }

    // Update ticket status based on resolution
    if (resolution_status) {
      const ticketStatus = resolution_status === 'resolved' ? 'closed' : 'open';
      await supabaseAdmin
        .from('tickets')
        .update({ 
          status: ticketStatus,
          satisfaction_score: satisfaction_score || null,
        })
        .eq('id', ticket_id)
        .eq('user_id', userId);
    }

    // Update deflection metrics for today
    await updateDeflectionMetrics(userId, customer_satisfied, aiResponse);

    // Update knowledge base and template success rates
    await updateSuccessRates(userId, ticket, aiResponse, customer_satisfied);

    return NextResponse.json({
      success: true,
      feedback_id: feedbackLog.id,
      message: 'Feedback recorded successfully',
      impact: {
        ai_response_updated: !!aiResponse,
        metrics_updated: true,
        learning_applied: !!aiResponse,
        ticket_status_updated: !!resolution_status,
      },
      next_actions: getNextActions(
        customer_satisfied,
        resolution_status,
        follow_up_needed
      ),
    });

  } catch (error) {
    console.error('Feedback processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Feedback processing failed' },
      { status: 500 }
    );
  }
}

async function updateDeflectionMetrics(
  userId: string,
  customerSatisfied: boolean,
  aiResponse: any
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get or create today's metrics
    const { data: existingMetrics, error: fetchError } = await supabaseAdmin
      .from('deflection_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Failed to fetch deflection metrics:', fetchError);
      return;
    }

    if (existingMetrics) {
      // Update existing metrics
      const updatedMetrics = {
        total_tickets: existingMetrics.total_tickets + 1,
        auto_resolved: aiResponse?.response_type === 'auto_resolve' 
          ? existingMetrics.auto_resolved + 1 
          : existingMetrics.auto_resolved,
        escalated: !aiResponse || aiResponse.response_type === 'escalate'
          ? existingMetrics.escalated + 1
          : existingMetrics.escalated,
        customer_satisfaction: calculateNewSatisfaction(
          existingMetrics.customer_satisfaction,
          existingMetrics.total_tickets - 1,
          customerSatisfied
        ),
        cost_savings_usd: existingMetrics.cost_savings_usd + 
          (customerSatisfied && aiResponse ? estimateCostSavings(aiResponse) : 0),
      };

      updatedMetrics.deflection_rate = updatedMetrics.auto_resolved / updatedMetrics.total_tickets;

      await supabaseAdmin
        .from('deflection_metrics')
        .update(updatedMetrics)
        .eq('id', existingMetrics.id);
    } else {
      // Create new metrics entry
      const newMetrics = {
        user_id: userId,
        date: today,
        total_tickets: 1,
        auto_resolved: aiResponse?.response_type === 'auto_resolve' ? 1 : 0,
        escalated: !aiResponse || aiResponse.response_type === 'escalate' ? 1 : 0,
        customer_satisfaction: customerSatisfied ? 1.0 : 0.0,
        avg_response_time_minutes: aiResponse ? 1 : null, // AI responses are instant
        cost_savings_usd: customerSatisfied && aiResponse ? estimateCostSavings(aiResponse) : 0,
        deflection_rate: aiResponse?.response_type === 'auto_resolve' ? 1.0 : 0.0,
      };

      await supabaseAdmin
        .from('deflection_metrics')
        .insert(newMetrics);
    }
  } catch (error) {
    console.error('Failed to update deflection metrics:', error);
  }
}

function calculateNewSatisfaction(
  currentSatisfaction: number,
  currentCount: number,
  newSatisfied: boolean
): number {
  const totalSatisfaction = currentSatisfaction * currentCount + (newSatisfied ? 1 : 0);
  return totalSatisfaction / (currentCount + 1);
}

function estimateCostSavings(aiResponse: any): number {
  // Estimate cost savings based on avoiding human agent time
  // Assume average agent cost is $25/hour and takes 15 minutes per ticket
  const agentCostPerTicket = 25 / 4; // $6.25 per 15-minute ticket
  const aiCost = aiResponse.cost_usd || 0;
  return Math.max(0, agentCostPerTicket - aiCost);
}

async function updateSuccessRates(
  userId: string,
  ticket: any,
  aiResponse: any,
  customerSatisfied: boolean
): Promise<void> {
  try {
    if (!aiResponse || !ticket.category) return;

    // Update knowledge base success rates
    // This would require tracking which KB articles were used
    // For now, update category-based articles
    await supabaseAdmin.rpc('update_knowledge_base_success_rate', {
      p_user_id: userId,
      p_category: ticket.category,
      p_success: customerSatisfied,
    });

    // Update response template success rates
    await supabaseAdmin.rpc('update_template_success_rate', {
      p_user_id: userId,
      p_category: ticket.category,
      p_success: customerSatisfied,
    });

  } catch (error) {
    console.error('Failed to update success rates:', error);
  }
}

function getNextActions(
  customerSatisfied: boolean,
  resolutionStatus?: string,
  followUpNeeded?: boolean
): string[] {
  const actions: string[] = [];

  if (!customerSatisfied) {
    actions.push('escalate_to_human_agent');
    actions.push('analyze_failure_pattern');
  }

  if (resolutionStatus === 'partially_resolved') {
    actions.push('schedule_follow_up');
    actions.push('provide_additional_resources');
  }

  if (followUpNeeded) {
    actions.push('schedule_follow_up_check');
  }

  if (customerSatisfied && resolutionStatus === 'resolved') {
    actions.push('close_ticket');
    actions.push('request_review_or_testimonial');
  }

  return actions.length > 0 ? actions : ['no_action_required'];
}

// GET endpoint to retrieve feedback for a ticket
export async function GET(request: NextRequest) {
  try {
    const user = await auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const ticketId = url.searchParams.get('ticket_id');
    const aiResponseId = url.searchParams.get('ai_response_id');

    if (!ticketId && !aiResponseId) {
      return NextResponse.json(
        { error: 'Either ticket_id or ai_response_id is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('feedback_logs')
      .select(`
        *,
        tickets:ticket_id (id, subject, category, status),
        ai_responses:ai_response_id (id, response_type, confidence_score, created_at)
      `)
      .eq('user_id', userId);

    if (ticketId) {
      query = query.eq('ticket_id', ticketId);
    }
    if (aiResponseId) {
      query = query.eq('ai_response_id', aiResponseId);
    }

    const { data: feedback, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback: feedback || [],
      summary: {
        total_feedback: feedback?.length || 0,
        satisfied_count: feedback?.filter(f => f.customer_satisfied).length || 0,
        average_satisfaction: feedback?.length 
          ? feedback.filter(f => f.satisfaction_score).reduce((sum, f) => sum + f.satisfaction_score, 0) / feedback.filter(f => f.satisfaction_score).length
          : null,
      },
    });

  } catch (error) {
    console.error('Feedback retrieval error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Feedback retrieval failed' },
      { status: 500 }
    );
  }
}