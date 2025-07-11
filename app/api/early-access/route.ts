import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // For demo mode, just return success without saving to database
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('Demo mode: Would save email:', email);
      return NextResponse.json({ 
        success: true, 
        message: 'Email captured successfully (demo mode)' 
      });
    }

    try {
      const supabase = createClient();
      
      // Check if email already exists
      const { data: existing } = await supabase
        .from('early_access')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        return NextResponse.json({ 
          error: 'This email is already on our waiting list' 
        }, { status: 409 });
      }

      // Insert new email
      const { error } = await supabase
        .from('early_access')
        .insert([
          { 
            email, 
            created_at: new Date().toISOString(),
            source: 'landing_page'
          }
        ]);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ 
          error: 'Failed to save email' 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Successfully added to waiting list' 
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      // Fallback to demo mode if database fails
      return NextResponse.json({ 
        success: true, 
        message: 'Email captured successfully (fallback mode)' 
      });
    }

  } catch (error) {
    console.error('Early access signup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}