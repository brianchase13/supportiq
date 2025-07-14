import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ProfileUpdateSchema = z.object({
  company_name: z.string().optional(),
  industry: z.string().optional(),
  monthly_tickets: z.number().min(0).optional(),
  support_channels: z.array(z.string()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Failed to fetch user profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: user.email,
        company_name: profile.company_name,
        industry: profile.industry,
        monthly_tickets: profile.monthly_tickets,
        support_channels: profile.support_channels,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });

  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = ProfileUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update user profile
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Get updated profile
    const { data: updatedProfile, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Failed to fetch updated profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch updated profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        email: user.email,
        company_name: updatedProfile.company_name,
        industry: updatedProfile.industry,
        monthly_tickets: updatedProfile.monthly_tickets,
        support_channels: updatedProfile.support_channels,
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Profile update failed' },
      { status: 500 }
    );
  }
} 