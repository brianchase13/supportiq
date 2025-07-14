import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TicketDeflectionEngine, TicketData } from '@/lib/deflection/engine';
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const RespondRequestSchema = z.object({
  ticket: z.object({
    id: z.string(),
    intercom_conversation_id: z.string(),
    content: z.string(),
    subject: z.string().optional(),
    customer_email: z.string().email(),
    category: z.string().optional(),
    priority: z.enum(['not_priority', 'priority']).optional(),
    created_at: z.string(),
  }),
  force: z.boolean().optional().default(false), // Force response even with low confidence
  dry_run: z.boolean().optional().default(false), // Don't actually send, just analyze
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
    const rateLimitResult = await apiLimiter.checkLimit(clientIP, 'deflection_respond');
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
    const validationResult = RespondRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { ticket, force, dry_run } = validationResult.data;

    // Verify ticket belongs to user
    const { data: existingTicket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', ticket.id)
      .eq('user_id', userId)
      .single();

    if (ticketError || !existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if ticket already has AI response
    const { data: existingResponse, error: responseError } = await supabaseAdmin
      .from('ai_responses')
      .select('*')
      .eq('ticket_id', ticket.id)
      .eq('user_id', userId)
      .single();

    if (!responseError && existingResponse && !force) {
      return NextResponse.json({
        success: false,
        error: 'Ticket already has AI response',
        existing_response: {
          id: existingResponse.id,
          response_type: existingResponse.response_type,
          confidence_score: existingResponse.confidence_score,
          created_at: existingResponse.created_at,
        },
        suggestion: 'Use force=true to generate new response',
      });
    }

    // Get user's deflection settings
    const settings = await TicketDeflectionEngine.getUserSettings(userId);

    // Create deflection engine
    const engine = new TicketDeflectionEngine(userId, settings);

    // Process the ticket
    const ticketData: TicketData = {
      id: ticket.id,
      user_id: userId,
      intercom_conversation_id: ticket.intercom_conversation_id,
      content: ticket.content,
      subject: ticket.subject,
      customer_email: ticket.customer_email,
      category: ticket.category,
      priority: ticket.priority,
      created_at: ticket.created_at,
    };

    const result = await engine.processTicket(ticketData);

    // If dry run, don't actually send or store anything
    if (dry_run) {
      return NextResponse.json({
        success: true,
        dry_run: true,
        analysis: {
          should_respond: result.shouldRespond,
          reason: result.reason,
          response: result.response ? {
            content: result.response.response_content,
            type: result.response.response_type,
            confidence: result.response.confidence_score,
            reasoning: result.response.reasoning,
            estimated_cost: result.response.cost_usd,
            tokens_used: result.response.tokens_used,
          } : null,
        },
        settings_used: settings,
      });
    }

    // Log the deflection attempt
    await logDeflectionAttempt(userId, ticket.id, result);

    if (result.shouldRespond && result.response) {
      return NextResponse.json({
        success: true,
        responded: true,
        response: {
          id: result.response.response_content,
          type: result.response.response_type,
          confidence: result.response.confidence_score,
          reasoning: result.response.reasoning,
          sent_to_customer: true,
          cost_usd: result.response.cost_usd,
          tokens_used: result.response.tokens_used,
        },
        ticket_status: result.response.response_type === 'auto_resolve' ? 'resolved' : 'in_progress',
        next_action: getNextAction(result.response.response_type),
      });
    } else {
      return NextResponse.json({
        success: true,
        responded: false,
        reason: result.reason,
        escalation_required: true,
        suggested_assignee: await getSuggestedAssignee(userId, ticket),
        next_action: 'assign_to_human_agent',
      });
    }

  } catch (error) {
    console.error('Deflection response error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Response generation failed' },
      { status: 500 }
    );
  }
}

async function logDeflectionAttempt(
  userId: string,
  ticketId: string,
  result: { shouldRespond: boolean; reason: string; response?: any }
): Promise<void> {
  try {
    await supabaseAdmin
      .from('deflection_logs')
      .insert({
        user_id: userId,
        ticket_id: ticketId,
        attempted_at: new Date().toISOString(),
        success: result.shouldRespond,
        reason: result.reason,
        confidence_score: result.response?.confidence_score || 0,
        response_type: result.response?.response_type || 'escalate',
        tokens_used: result.response?.tokens_used || 0,
        cost_usd: result.response?.cost_usd || 0,
      });
  } catch (error) {
    console.error('Failed to log deflection attempt:', error);
  }
}

function getNextAction(responseType: string): string {
  switch (responseType) {
    case 'auto_resolve':
      return 'monitor_customer_satisfaction';
    case 'follow_up':
      return 'schedule_follow_up_check';
    case 'escalate':
      return 'assign_to_human_agent';
    default:
      return 'manual_review_required';
  }
}

async function getSuggestedAssignee(userId: string, ticket: any): Promise<string | null> {
  // This would integrate with your team management system
  // For now, return a simple category-based suggestion
  const categoryAssignments: Record<string, string> = {
    'billing': 'billing_team',
    'technical': 'technical_team',
    'general': 'general_support',
    'bug': 'engineering_team',
  };

  return categoryAssignments[ticket.category || 'general'] || 'general_support';
}

// GET endpoint to analyze ticket without responding
export async function GET(request: NextRequest) {
  try {
    const user = await auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const ticketId = url.searchParams.get('ticket_id');

    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticket_id' }, { status: 400 });
    }

    // Get ticket data
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', userId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Get existing AI response if any
    const { data: existingResponse } = await supabaseAdmin
      .from('ai_responses')
      .select('*')
      .eq('ticket_id', ticketId)
      .eq('user_id', userId)
      .single();

    // Get deflection settings
    const settings = await TicketDeflectionEngine.getUserSettings(userId);

    // Analyze ticket complexity and deflection potential
    const engine = new TicketDeflectionEngine(userId, settings);
    const ticketData: TicketData = {
      id: ticket.id,
      user_id: userId,
      intercom_conversation_id: ticket.intercom_conversation_id,
      content: ticket.content,
      subject: ticket.subject,
      customer_email: ticket.customer_email,
      category: ticket.category,
      priority: ticket.priority,
      created_at: ticket.created_at,
    };

    // Run preflight checks
    const preflightResult = (engine as any).preflightChecks(ticketData);

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        created_at: ticket.created_at,
      },
      analysis: {
        can_process: preflightResult.shouldProcess,
        reason: preflightResult.reason,
        complexity: await analyzeComplexity(ticket.content, ticket.subject),
        estimated_confidence: await estimateConfidence(ticket, settings),
        recommended_action: preflightResult.shouldProcess ? 'generate_response' : 'escalate_to_human',
      },
      existing_response: existingResponse ? {
        id: existingResponse.id,
        type: existingResponse.response_type,
        confidence: existingResponse.confidence_score,
        created_at: existingResponse.created_at,
        sent_to_intercom: existingResponse.sent_to_intercom,
      } : null,
      settings: {
        auto_response_enabled: settings.auto_response_enabled,
        confidence_threshold: settings.confidence_threshold,
        escalation_threshold: settings.escalation_threshold,
      },
    });

  } catch (error) {
    console.error('Ticket analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

async function analyzeComplexity(content: string, subject?: string): Promise<{
  level: 'low' | 'medium' | 'high';
  factors: string[];
  reasoning: string;
}> {
  const text = (content + ' ' + (subject || '')).toLowerCase();
  const factors: string[] = [];
  
  // Check for complexity indicators
  if (text.includes('billing') || text.includes('payment') || text.includes('refund')) {
    factors.push('billing_related');
  }
  if (text.includes('bug') || text.includes('error') || text.includes('crash')) {
    factors.push('technical_issue');
  }
  if (text.includes('angry') || text.includes('frustrated') || text.includes('terrible')) {
    factors.push('emotional_content');
  }
  if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
    factors.push('time_sensitive');
  }
  if (text.length > 1000) {
    factors.push('lengthy_description');
  }

  let level: 'low' | 'medium' | 'high' = 'low';
  let reasoning = 'Simple inquiry with standard resolution path';

  if (factors.length >= 3) {
    level = 'high';
    reasoning = 'Multiple complexity factors detected, requires careful handling';
  } else if (factors.length >= 1) {
    level = 'medium';
    reasoning = 'Some complexity factors present, may need human review';
  }

  return { level, factors, reasoning };
}

async function estimateConfidence(ticket: any, settings: any): Promise<number> {
  // Simple confidence estimation based on ticket characteristics
  let baseConfidence = 0.5;

  // Increase confidence for common categories
  if (['general', 'how_to', 'account'].includes(ticket.category)) {
    baseConfidence += 0.2;
  }

  // Decrease confidence for complex categories
  if (['billing', 'technical', 'bug'].includes(ticket.category)) {
    baseConfidence -= 0.2;
  }

  // Adjust for priority
  if (ticket.priority === 'priority') {
    baseConfidence -= 0.1;
  }

  // Adjust for content length
  const contentLength = ticket.content?.length || 0;
  if (contentLength < 100) {
    baseConfidence += 0.1; // Short, likely simple
  } else if (contentLength > 500) {
    baseConfidence -= 0.1; // Long, likely complex
  }

  return Math.max(0, Math.min(1, baseConfidence));
}