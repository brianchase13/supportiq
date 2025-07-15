import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ResponseTemplateSystem } from '@/lib/ai/response-templates';
import { z } from 'zod';

const CreateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  category: z.string().min(1, 'Category is required'),
  template_content: z.string().min(10, 'Template content must be at least 10 characters'),
  trigger_keywords: z.array(z.string()).min(1, 'At least one trigger keyword is required'),
  variables: z.record(z.string(), z.unknown()).optional()
});

const UpdateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  template_content: z.string().min(10).optional(),
  trigger_keywords: z.array(z.string()).optional(),
  variables: z.record(z.string(), z.unknown()).optional(),
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
    const includeAnalytics = searchParams.get('analytics') === 'true';

    const templateSystem = new ResponseTemplateSystem();
    const templates = await templateSystem.getTemplates(user.id);

    let analytics = null;
    if (includeAnalytics) {
      analytics = await templateSystem.getTemplateAnalytics(user.id);
    }

    return NextResponse.json({
      templates,
      analytics,
      count: templates.length
    });

  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
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
    const validationResult = CreateTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const templateSystem = new ResponseTemplateSystem();
    const { template_content, trigger_keywords, variables, ...rest } = validationResult.data;
    const variablesArray = variables
      ? Object.entries(variables).map(([name, value]) => ({
          name,
          type: 'text' as const, // ensure correct type
          placeholder: '',
          required: false,
          ...((typeof value === 'object' && value !== null) ? value : {})
        }))
      : [];
    const template = await templateSystem.createTemplate({
      ...rest,
      user_id: user.id,
      content: template_content,
      keywords: trigger_keywords,
      variables: variablesArray,
      active: true,
      priority: 1,
      tags: [],
    });

    return NextResponse.json({
      success: true,
      template,
      message: 'Template created successfully'
    });

  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
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
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const templateSystem = new ResponseTemplateSystem();
    const { variables, ...restUpdate } = updateData;
    const validationResult = UpdateTemplateSchema.safeParse(restUpdate);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Only add variables if present and converted to array
    let updatePayload: any = { ...validationResult.data };
    if (variables) {
      const variablesArray = Object.entries(variables).map(([name, value]) => ({
        name,
        type: 'text' as const,
        placeholder: '',
        required: false,
        ...((typeof value === 'object' && value !== null) ? value : {})
      }));
      if (variablesArray.length > 0) {
        updatePayload.variables = variablesArray;
      }
    }
    const template = await templateSystem.updateTemplate(id, updatePayload);

    return NextResponse.json({
      success: true,
      template,
      message: 'Template updated successfully'
    });

  } catch (error) {
    console.error('Template update error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
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
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const templateSystem = new ResponseTemplateSystem();
    await templateSystem.deleteTemplate(id);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Template deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}