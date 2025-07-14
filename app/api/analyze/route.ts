import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { analysisLimiter, checkRateLimit } from '@/lib/rate-limit';
import { generateBatchEmbeddings, findSimilarTickets } from '@/lib/ai/embeddings';
import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const AnalyzeRequestSchema = z.object({
  ticketIds: z.array(z.string()).optional(),
  forceReanalysis: z.boolean().optional().default(false),
  useCheapModel: z.boolean().optional().default(false),
});

interface AnalysisResult {
  ticketId: string;
  category: string;
  sentimentScore: number;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  confidence: number;
  embedding?: number[];
  similarTickets?: string[];
}

interface TicketData {
  id: string;
  subject?: string;
  content?: string;
  category?: string;
  sentiment?: number;
  embedding?: number[];
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting for expensive AI operations
    const rateLimitResult = await analysisLimiter.checkLimit(userId, 'analysis');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded for AI analysis operations. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { status: 429 }
      );
    }

    // Return demo data if OpenAI is not configured
    if (!openai) {
      return NextResponse.json({
        success: true,
        analyzedCount: 25,
        skippedCount: 5,
        totalTokensUsed: 4200,
        totalCost: 0.0425,
        model: 'demo-mode',
        message: 'Running in demo mode - OpenAI not configured'
      });
    }

    const body = await request.json();

    // Validate request
    const validationResult = AnalyzeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { ticketIds, forceReanalysis, useCheapModel } = validationResult.data;

    // Check user subscription and limits
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        subscription_plans(ticket_limit, features)
      `)
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get tickets to analyze
    let ticketsQuery = supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('user_id', userId);

    if (ticketIds && ticketIds.length > 0) {
      ticketsQuery = ticketsQuery.in('id', ticketIds);
    } else if (!forceReanalysis) {
      // Only analyze tickets that haven't been analyzed or are expired
      ticketsQuery = ticketsQuery
        .or('category.is.null,cached_until.lt.now()')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(50); // Limit to control costs
    }

    const { data: tickets, error: ticketsError } = await ticketsQuery;

    if (ticketsError) {
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ 
        message: 'No tickets to analyze',
        analyzedCount: 0,
        skippedCount: 0,
        totalCost: 0
      });
    }

    // Check if analysis would exceed limits
    const estimatedCost = calculateEstimatedCost(tickets, useCheapModel);
    const maxCostPerMonth = userData.subscription_plan === 'free' ? 1.0 : 
                           userData.subscription_plan === 'starter' ? 10.0 : 50.0;

    if (estimatedCost > maxCostPerMonth) {
      return NextResponse.json({
        error: 'Analysis would exceed cost limits',
        estimatedCost,
        maxCost: maxCostPerMonth,
        upgradeUrl: '/pricing'
      }, { status: 402 });
    }

    let totalTokensUsed = 0;
    let totalCost = 0;
    let analyzedCount = 0;
    let skippedCount = 0;

    // Process tickets in optimized batches
    const batchSize = useCheapModel ? 20 : 10; // Larger batches for cheaper model
    const batches = [];
    for (let i = 0; i < tickets.length; i += batchSize) {
      batches.push(tickets.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      try {
        // Generate embeddings first (cheaper operation)
        const embeddings = await generateEmbeddingsForBatch(batch);
        
        // Smart analysis - use similarity to skip obvious duplicates
        const { toAnalyze, toSkip } = await smartBatchFiltering(batch, embeddings, userId);
        
        skippedCount += toSkip.length;

        if (toAnalyze.length === 0) {
          continue;
        }

        // Choose model based on cost optimization
        const model = useCheapModel ? 'gpt-4o-mini' : 'gpt-4o';
        
        // Batch analyze with GPT
        const analysisResults = await analyzeBatchWithGPT(toAnalyze, model);
        
        // Calculate costs
        const batchTokens = estimateTokensUsed(toAnalyze, model);
        const batchCost = calculateBatchCost(batchTokens, model);
        
        totalTokensUsed += batchTokens;
        totalCost += batchCost;
        analyzedCount += analysisResults.length;

        // Update tickets with analysis results and embeddings
        await updateTicketsWithAnalysis(toAnalyze, analysisResults, embeddings, userId);

        // Rate limiting between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (batchError) {
        console.error('Batch analysis error:', batchError);
        // Continue with next batch instead of failing completely
      }
    }

    // Update usage tracking
    await supabaseAdmin.rpc('update_user_usage', {
      p_user_id: userId,
      p_operation_type: 'analyze',
      p_tokens_used: totalTokensUsed,
      p_cost_usd: totalCost
    });

    return NextResponse.json({
      success: true,
      analyzedCount,
      skippedCount,
      totalTokensUsed,
      totalCost: Math.round(totalCost * 10000) / 10000, // Round to 4 decimal places
      model: useCheapModel ? 'gpt-4o-mini' : 'gpt-4o',
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

async function generateEmbeddingsForBatch(tickets: TicketData[]): Promise<Map<string, number[]>> {
  const texts = tickets.map(ticket => 
    `${ticket.subject || ''} ${ticket.content || ''}`.trim()
  );
  
  const embeddings = await generateBatchEmbeddings(texts);
  const embeddingMap = new Map<string, number[]>();
  
  tickets.forEach((ticket, index) => {
    embeddingMap.set(ticket.id, embeddings[index]);
  });
  
  return embeddingMap;
}

async function smartBatchFiltering(
  batch: TicketData[], 
  embeddings: Map<string, number[]>, 
  userId: string
): Promise<{ toAnalyze: TicketData[], toSkip: TicketData[] }> {
  // Get existing analyzed tickets for similarity comparison
  const { data: existingTickets } = await supabaseAdmin
    .from('tickets')
    .select('id, category, sentiment, embedding, content')
    .eq('user_id', userId)
    .not('category', 'is', null)
    .not('embedding', 'is', null)
    .limit(100);

  const toAnalyze: any[] = [];
  const toSkip: any[] = [];

  for (const ticket of batch) {
    const ticketEmbedding = embeddings.get(ticket.id);
    if (!ticketEmbedding) {
      toAnalyze.push(ticket);
      continue;
    }

    // Find similar tickets
    const similarTickets = findSimilarTickets(
      ticketEmbedding,
      (existingTickets || []).map(t => ({
        id: t.id,
        embedding: t.embedding,
        category: t.category,
        content: t.content || ''
      })),
      0.9, // High similarity threshold
      1
    );

    if (similarTickets.length > 0) {
      // Copy analysis from similar ticket
      const similar = similarTickets[0];
      const existingTicket = existingTickets?.find(t => t.id === similar.ticketId);
      
      if (existingTicket) {
        // Update with similar ticket's analysis
        await supabaseAdmin
          .from('tickets')
          .update({
            category: existingTicket.category,
            sentiment: existingTicket.sentiment,
            embedding: ticketEmbedding,
            analysis_version: 2, // Mark as similarity-based
            cached_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            similar_tickets: [existingTicket.id]
          })
          .eq('id', ticket.id);
        
        toSkip.push(ticket);
        continue;
      }
    }

    toAnalyze.push(ticket);
  }

  return { toAnalyze, toSkip };
}

async function analyzeBatchWithGPT(tickets: any[], model: string): Promise<AnalysisResult[]> {
  if (!openai) {
    // Return mock analysis results
    return tickets.map(ticket => ({
      ticketId: ticket.id,
      category: ['Bug', 'Feature Request', 'How-to', 'Billing', 'Technical Issue'][Math.floor(Math.random() * 5)],
      sentimentScore: Math.random() * 2 - 1,
      sentimentLabel: Math.random() > 0.5 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative' as any,
      confidence: 0.8 + Math.random() * 0.2
    }));
  }

  const ticketTexts = tickets.map((ticket, index) => 
    `Ticket ${index + 1} (ID: ${ticket.id}):\nSubject: ${ticket.subject || 'No subject'}\nContent: ${(ticket.content || '').substring(0, 1000)}\n---`
  ).join('\n\n');

  const prompt = `Analyze these customer support tickets. Provide categorization and sentiment analysis for each:

${ticketTexts}

Categories: Bug, Feature Request, How-to, Billing, Technical Issue, Account, Other
Sentiment: Rate from -1.0 (very negative) to 1.0 (very positive)

Respond in JSON format:
{
  "tickets": [
    {
      "ticketId": "ticket_id",
      "category": "category_name",
      "sentimentScore": 0.0,
      "sentimentLabel": "neutral|positive|negative",
      "confidence": 0.95
    }
  ]
}`;

  const response = await openai!.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert at analyzing customer support tickets. Provide accurate, consistent categorization and sentiment analysis.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    max_tokens: model === 'gpt-4o-mini' ? 1500 : 2000,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result.tickets || [];
}

async function updateTicketsWithAnalysis(
  tickets: any[], 
  analysisResults: AnalysisResult[], 
  embeddings: Map<string, number[]>,
  userId: string
) {
  const updates = analysisResults.map(result => {
    const ticket = tickets.find(t => t.id === result.ticketId);
    if (!ticket) return null;

    return {
      id: ticket.id,
      category: result.category,
      sentiment: result.sentimentLabel,
      sentiment_score: result.sentimentScore,
      embedding: embeddings.get(ticket.id),
      analysis_version: 1,
      cached_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }).filter(Boolean);

  // Batch update
  for (const update of updates) {
    await supabaseAdmin
      .from('tickets')
      .update(update)
      .eq('id', update.id);
  }
}

function calculateEstimatedCost(tickets: any[], useCheapModel: boolean): number {
  const avgTokensPerTicket = 200; // Conservative estimate
  const totalTokens = tickets.length * avgTokensPerTicket;
  
  // Pricing per 1k tokens (as of 2024)
  const pricePerToken = useCheapModel ? 0.00015 : 0.01; // GPT-4o-mini vs GPT-4o
  
  return (totalTokens / 1000) * pricePerToken;
}

function estimateTokensUsed(tickets: any[], model: string): number {
  // More accurate token estimation
  const baseTokensPerTicket = model === 'gpt-4o-mini' ? 150 : 200;
  return tickets.length * baseTokensPerTicket;
}

function calculateBatchCost(tokens: number, model: string): number {
  const pricePerToken = model === 'gpt-4o-mini' ? 0.00015 : 0.01;
  return (tokens / 1000) * pricePerToken;
}