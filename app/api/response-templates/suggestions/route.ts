import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ResponseTemplateSystem } from '@/lib/ai/response-templates';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting for AI operations
    const { analysisLimiter } = await import('@/lib/rate-limit');
    const rateLimitResult = await analysisLimiter.checkLimit(user.id, 'template_suggestions');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const templateSystem = new ResponseTemplateSystem();
    const suggestions = await templateSystem.getDefaultTemplates();
    
    // Limit the suggestions to the requested number
    const limitedSuggestions = suggestions.slice(0, limit);

    return NextResponse.json({
      suggestions: limitedSuggestions,
      count: limitedSuggestions.length,
      message: limitedSuggestions.length > 0 
        ? `Generated ${limitedSuggestions.length} template suggestions based on recent tickets`
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
    const supabase = await createClient();
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
    const templateSystem = new ResponseTemplateSystem();
    const template = await templateSystem.createTemplate({
      name: suggestion.name,
      category: suggestion.category,
      content: suggestion.template_content,
      keywords: suggestion.trigger_keywords,
      variables: [],
      active: true,
      priority: 1,
      tags: [],
      user_id: user.id
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