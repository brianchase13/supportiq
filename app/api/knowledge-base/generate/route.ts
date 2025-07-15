import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FAQGenerator } from '@/lib/ai/faq-generator';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting for expensive operations
    const { analysisLimiter } = await import('@/lib/rate-limit');
    const rateLimitResult = await analysisLimiter.checkLimit(user.id, 'faq_generate');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      daysBack = 30, 
      minTicketCount = 3, 
      maxFAQs = 10,
      force = false 
    } = body;

    // Check if user has recent FAQ generation (unless forced)
    if (!force) {
      const { data: recentGeneration } = await supabase
        .from('knowledge_base')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .limit(1);

      if (recentGeneration && recentGeneration.length > 0) {
        return NextResponse.json({
          error: 'FAQ generation was run recently. Use force=true to override.',
          lastGeneration: recentGeneration[0].created_at
        }, { status: 429 });
      }
    }

    // Initialize FAQ generator
    const faqGenerator = new FAQGenerator();

    // Generate FAQs
    const generatedFAQs = await faqGenerator.generateFAQFromTickets(user.id, daysBack);

    return NextResponse.json({
      success: true,
      generatedFAQs,
      count: generatedFAQs.length,
      message: `Generated ${generatedFAQs.length} FAQ articles from recent tickets`
    });

  } catch (error) {
    console.error('FAQ generation error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'FAQ generation failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user's knowledge base
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const faqGenerator = new FAQGenerator();
    const knowledgeBase = await faqGenerator.generateKnowledgeBaseArticles(user.id);

    return NextResponse.json({
      knowledgeBase,
      count: knowledgeBase.length
    });

  } catch (error) {
    console.error('Knowledge base fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
      { status: 500 }
    );
  }
}