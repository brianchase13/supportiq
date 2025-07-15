import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RealTicketProcessor, TicketData } from '@/lib/ai/processor';
import { TrialManager } from '@/lib/trial/manager';
import { z } from 'zod';

const ProcessTicketSchema = z.object({
  ticketId: z.string().optional(),
  subject: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  customerEmail: z.string().email('Invalid email address'),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  intercomConversationId: z.string().optional(),
  dryRun: z.boolean().optional().default(false)
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = ProcessTicketSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { 
      ticketId, 
      subject, 
      content, 
      customerEmail, 
      category, 
      priority, 
      intercomConversationId,
      dryRun 
    } = validationResult.data;

    // Check trial status
    const trialStatus = await TrialManager.getTrialStatus(user.id);
    if (!trialStatus || trialStatus.status !== 'active') {
      return NextResponse.json({
        error: 'No active trial found',
        message: 'Please start a trial to use AI ticket processing'
      }, { status: 403 });
    }

    // Check trial limits
    const limitCheck = await TrialManager.checkTrialLimits(user.id, 'ai_responses_used');
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: 'Trial limit exceeded',
        message: `You've used ${limitCheck.used}/${limitCheck.limit} AI responses. Upgrade to continue.`,
        limits: limitCheck
      }, { status: 429 });
    }

    // Create ticket data
    const ticketData: TicketData = {
      id: ticketId || `temp_${Date.now()}`,
      user_id: user.id,
      subject,
      content,
      customer_email: customerEmail,
      category,
      priority,
      created_at: new Date().toISOString(),
      intercom_conversation_id: intercomConversationId
    };

    // Process ticket with AI
    const processor = new RealTicketProcessor(user.id);
    const result = await processor.processTicket(ticketData);

    if (!result.success) {
      return NextResponse.json({
        error: 'Processing failed',
        reason: result.reason
      }, { status: 500 });
    }

    // If dry run, don't track usage
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dry_run: true,
        should_respond: result.should_respond,
        response: result.response ? {
          content: result.response.response_content,
          type: result.response.response_type,
          confidence: result.response.confidence_score,
          reasoning: result.response.reasoning,
          cost_usd: result.response.cost_usd,
          tokens_used: result.response.tokens_used
        } : null,
        reason: result.reason,
        trial_limits: limitCheck
      });
    }

    // Return processing result
    return NextResponse.json({
      success: true,
      should_respond: result.should_respond,
      response: result.response ? {
        content: result.response.response_content,
        type: result.response.response_type,
        confidence: result.response.confidence_score,
        reasoning: result.response.reasoning,
        cost_usd: result.response.cost_usd,
        tokens_used: result.response.tokens_used,
        suggested_actions: result.response.suggested_actions,
        follow_up_required: result.response.follow_up_required,
        escalation_triggers: result.response.escalation_triggers
      } : null,
      reason: result.reason,
      usage_tracked: result.usage_tracked,
      trial_limits: {
        ...limitCheck,
        remaining: limitCheck.remaining - (result.usage_tracked ? 1 : 0)
      }
    });

  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
} 