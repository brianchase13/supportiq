import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ResponseTemplateEngine } from '@/lib/ai/response-templates';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for AI operations
    const rateLimitResult = await rateLimit(request, {
      interval: '1h',
      uniqueTokenPerInterval: 10, // 10 suggestions per hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const templateEngine = new ResponseTemplateEngine(user.id);
    const suggestions = await templateEngine.generateTemplateSuggestions(limit);

    return NextResponse.json({
      suggestions,
      count: suggestions.length,
      message: suggestions.length > 0 
        ? `Generated ${suggestions.length} template suggestions based on recent tickets`
        : 'No template suggestions available. Process more tickets to get AI-powered suggestions.'
    });

  } catch (error) {
    console.error('Template suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate template suggestions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { suggestion } = body;

    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion data is required' }, { status: 400 });
    }

    // Create template from suggestion
    const templateEngine = new ResponseTemplateEngine(user.id);
    const template = await templateEngine.createTemplate({
      name: suggestion.name,
      category: suggestion.category,
      template_content: suggestion.template_content,
      trigger_keywords: suggestion.trigger_keywords,
      variables: {}
    });

    return NextResponse.json({
      success: true,
      template,
      message: 'Template created from suggestion successfully'
    });

  } catch (error) {
    console.error('Template creation from suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to create template from suggestion' },
      { status: 500 }
    );
  }
}