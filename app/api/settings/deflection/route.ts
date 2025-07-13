import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized - No valid session' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's deflection settings
    const { data: settings, error } = await supabaseAdmin
      .from('user_settings')
      .select('deflection_settings')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching deflection settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Return default settings if none exist
    const defaultSettings = {
      enabled: true,
      autoRespond: true,
      deflectionThreshold: 0.8,
      responseTemplates: [
        {
          id: '1',
          name: 'FAQ Response',
          content: 'Hi there! I found a helpful answer to your question in our FAQ: [LINK]. This should resolve your issue. Let me know if you need anything else!',
          category: 'general',
          active: true
        },
        {
          id: '2',
          name: 'Account Access',
          content: 'I can help you with account access. Please try resetting your password here: [LINK]. If that doesn\'t work, I\'ll escalate this to our team.',
          category: 'account',
          active: true
        },
        {
          id: '3',
          name: 'Feature Request',
          content: 'Thank you for your feature request! I\'ve logged this for our product team. We\'ll review it and get back to you if we have any questions.',
          category: 'feature',
          active: false
        }
      ],
      categories: [
        { id: '1', name: 'General Questions', enabled: true, threshold: 0.8 },
        { id: '2', name: 'Account Issues', enabled: true, threshold: 0.7 },
        { id: '3', name: 'Billing', enabled: false, threshold: 0.9 },
        { id: '4', name: 'Technical Support', enabled: true, threshold: 0.6 },
        { id: '5', name: 'Feature Requests', enabled: false, threshold: 0.8 }
      ],
      workingHours: {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York'
      }
    };

    return NextResponse.json(settings?.deflection_settings || defaultSettings);
  } catch (error) {
    console.error('Error in deflection settings GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized - No valid session' }, { status: 401 });
    }

    const userId = session.user.id;
    const settings = await request.json();

    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }

    // Upsert settings
    const { error } = await supabaseAdmin
      .from('user_settings')
      .upsert({
        user_id: userId,
        deflection_settings: settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving deflection settings:', error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error in deflection settings PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 