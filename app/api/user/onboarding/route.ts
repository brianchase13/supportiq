import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const OnboardingRequestSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  monthlyTickets: z.number().min(0, 'Monthly tickets must be 0 or greater'),
  supportChannels: z.array(z.string()),
  onboardingCompleted: z.boolean()
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
    const validationResult = OnboardingRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { companyName, industry, monthlyTickets, supportChannels, onboardingCompleted } = validationResult.data;

    // Update user profile
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        company_name: companyName,
        industry,
        monthly_tickets: monthlyTickets,
        support_channels: supportChannels,
        onboarding_completed: onboardingCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Create initial user settings
    const { error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .upsert({
        user_id: user.id,
        email_notifications: true,
        weekly_reports: true,
        auto_analysis: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (settingsError) {
      console.error('Failed to create user settings:', settingsError);
      // Don't fail the request for settings error
    }

    // Create welcome insight
    const { error: insightError } = await supabaseAdmin
      .from('insights')
      .insert({
        user_id: user.id,
        type: 'welcome',
        title: 'Welcome to SupportIQ!',
        description: `Welcome ${companyName}! We're excited to help you optimize your customer support. Connect your first support channel to get started.`,
        impact_score: 100,
        status: 'active',
        created_at: new Date().toISOString()
      });

    if (insightError) {
      console.error('Failed to create welcome insight:', insightError);
      // Don't fail the request for insight error
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Onboarding failed' },
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

    // Get user profile
    const { data: userProfile, error } = await supabaseAdmin
      .from('users')
      .select('onboarding_completed, company_name, industry, monthly_tickets, support_channels')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    return NextResponse.json({
      onboardingCompleted: userProfile.onboarding_completed || false,
      profile: userProfile
    });

  } catch (error) {
    console.error('Failed to fetch onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
} 