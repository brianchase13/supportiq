import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const CreateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional().default([])
});

const UpdateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: articles, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      articles: articles || [],
      count: articles?.length || 0
    });

  } catch (error) {
    console.error('Knowledge base fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
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
    const validationResult = CreateArticleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, content, category, tags } = validationResult.data;

    const { data: article, error } = await supabaseAdmin
      .from('knowledge_base')
      .insert({
        user_id: user.id,
        title,
        content,
        category,
        tags,
        usage_count: 0,
        success_rate: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      article,
      message: 'Article created successfully'
    });

  } catch (error) {
    console.error('Article creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const validationResult = UpdateArticleSchema.safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Verify article belongs to user
    const { data: existingArticle, error: fetchError } = await supabaseAdmin
      .from('knowledge_base')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const { data: article, error } = await supabaseAdmin
      .from('knowledge_base')
      .update({
        ...validationResult.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      article,
      message: 'Article updated successfully'
    });

  } catch (error) {
    console.error('Article update error:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Verify article belongs to user before deleting
    const { data: existingArticle, error: fetchError } = await supabaseAdmin
      .from('knowledge_base')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('knowledge_base')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Article deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}