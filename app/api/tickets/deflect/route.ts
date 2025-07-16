import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { ticketDeflectionEngine, TicketAnalysis } from '@/lib/ai/ticket-deflection';
import { DeflectionResponse } from '@/lib/types';
import { z } from 'zod';
import { logger } from '@/lib/logging/logger';

const DeflectionRequestSchema = z.object({
  ticketId: z.string().optional(),
  ticketIds: z.array(z.string()).optional(),
  autoRespond: z.boolean().optional().default(false),
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
    const validationResult = DeflectionRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { ticketId, ticketIds, autoRespond, dryRun } = validationResult.data;

    // Get tickets to analyze
    let ticketsQuery = supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .is('deflected', null); // Only analyze non-deflected tickets

    if (ticketId) {
      ticketsQuery = ticketsQuery.eq('id', ticketId);
    } else if (ticketIds && ticketIds.length > 0) {
      ticketsQuery = ticketsQuery.in('id', ticketIds);
    } else {
      // Analyze recent unanalyzed tickets
      ticketsQuery = ticketsQuery
        .is('category', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10);
    }

    const { data: tickets, error: ticketsError } = await ticketsQuery;

    if (ticketsError) {
      await logger.error('Failed to fetch tickets:', ticketsError instanceof Error ? ticketsError : new Error(String(ticketsError)));
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ 
        message: 'No tickets to analyze',
        analyzedCount: 0,
        deflectedCount: 0
      });
    }

    // Get existing analyzed tickets for similarity search
    const { data: existingTickets } = await supabaseAdmin
      .from('tickets')
      .select('id, content, category, sentiment, embedding')
      .eq('user_id', user.id)
      .not('category', 'is', null)
      .not('embedding', 'is', null)
      .limit(100);

    const results = [];
    let deflectedCount = 0;

    for (const ticket of tickets) {
      try {
        // Analyze ticket
        const analysis = await ticketDeflectionEngine.analyzeTicket(ticket, existingTickets || []);
        
        // Generate deflection response
        const deflectionResponse = await ticketDeflectionEngine.generateDeflectionResponse(analysis, ticket);

        const result = {
          ticketId: ticket.id,
          analysis,
          deflectionResponse,
          deflected: deflectionResponse.can_deflect && !dryRun
        };

        results.push(result);

        if (deflectionResponse.can_deflect && !dryRun) {
          deflectedCount++;
        }

        // Update ticket with analysis (unless dry run)
        if (!dryRun) {
          await supabaseAdmin
            .from('tickets')
            .update({
              category: analysis.category,
              subcategory: analysis.subcategory,
              priority: analysis.priority,
              sentiment: analysis.sentiment,
              sentiment_score: analysis.sentimentScore,
              deflection_potential: analysis.deflectionPotential,
              confidence: analysis.confidence,
              keywords: analysis.keywords,
              intent: analysis.intent,
              estimated_resolution_time: analysis.estimatedResolutionTime,
              requires_human: analysis.requiresHuman,
              tags: analysis.tags,
              similar_tickets: analysis.similarTickets,
              deflected: deflectionResponse.can_deflect,
              deflection_response: deflectionResponse.response_content,
              deflection_confidence: deflectionResponse.confidence,
              updated_at: new Date().toISOString()
            })
            .eq('id', ticket.id);

          // If auto-respond is enabled and we can deflect, send the response
          if (autoRespond && deflectionResponse.can_deflect) {
            await sendAutomatedResponse(ticket, deflectionResponse, user.id);
          }
        }

      } catch (error) {
        await logger.error('Failed to analyze ticket ${ticket.id}:', error instanceof Error ? error : new Error(String(error)));
        results.push({
          ticketId: ticket.id,
          error: error instanceof Error ? error.message : 'Analysis failed',
          deflected: false
        });
      }
    }

    // Calculate metrics
    const allTickets = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('user_id', user.id);

    const metrics = ticketDeflectionEngine.calculateDeflectionMetrics(allTickets.data || []);

    return NextResponse.json({
      success: true,
      analyzedCount: tickets.length,
      deflectedCount,
      deflectionRate: tickets.length > 0 ? (deflectedCount / tickets.length) * 100 : 0,
      results,
      metrics,
      dryRun
    });

  } catch (error) {
    await logger.error('Ticket deflection error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deflection failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get deflection metrics
    const { data: tickets } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('user_id', user.id);

    const metrics = ticketDeflectionEngine.calculateDeflectionMetrics(tickets || []);

    // Get recent deflection activity
    const { data: recentDeflections } = await supabaseAdmin
      .from('tickets')
      .select('id, subject, category, deflected, deflection_confidence, created_at')
      .eq('user_id', user.id)
      .not('deflected', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      metrics,
      recentDeflections: recentDeflections || [],
      deflectionEngine: {
        status: 'active',
        version: '1.0.0',
        features: ['AI Analysis', 'Automated Responses', 'Smart Categorization']
      }
    });

  } catch (error) {
    await logger.error('Failed to fetch deflection data:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch deflection data' },
      { status: 500 }
    );
  }
}

async function sendAutomatedResponse(ticket: any, deflectionResponse: DeflectionResponse, userId: string) {
  try {
    // Create automated response record
    const { error: responseError } = await supabaseAdmin
      .from('ticket_responses')
      .insert({
        ticket_id: ticket.id,
        user_id: userId,
        response_type: 'automated',
        content: deflectionResponse.response_content,
        confidence: deflectionResponse.confidence,
        sent_at: new Date().toISOString(),
        metadata: {
          deflectionEngine: true,
          suggested_actions: deflectionResponse.suggested_actions,
          follow_up_required: deflectionResponse.follow_up_required
        }
      });

    if (responseError) {
      await logger.error('Failed to save automated response:', responseError instanceof Error ? responseError : new Error(String(responseError)));
    }

    // Update ticket with response sent
    await supabaseAdmin
      .from('tickets')
      .update({
        response_sent: true,
        response_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', ticket.id);

    // TODO: Integrate with actual support platform (Intercom, Zendesk, etc.)
    // This would send the actual response to the customer
    await logger.info(`Automated response sent for ticket ${ticket.id}:`, { response_content: deflectionResponse.response_content });

  } catch (error) {
    await logger.error('Failed to send automated response:', error instanceof Error ? error : new Error(String(error)));
  }
} 