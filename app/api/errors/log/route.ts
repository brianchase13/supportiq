import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Log error even if user is not authenticated (for client-side errors)
    const errorData = await request.json();
    
    // In production, you might want to send this to a monitoring service like Sentry
    console.error('Client Error Logged:', {
      errorId: errorData.errorId,
      message: errorData.message,
      url: errorData.url,
      userAgent: errorData.userAgent,
      timestamp: errorData.timestamp,
      userId: user?.id || 'anonymous'
    });

    // If user is authenticated, store error in database
    if (user) {
      try {
        await supabase
          .from('error_logs')
          .insert({
            user_id: user.id,
            error_id: errorData.errorId,
            message: errorData.message,
            stack: errorData.stack,
            component_stack: errorData.componentStack,
            url: errorData.url,
            user_agent: errorData.userAgent,
            created_at: errorData.timestamp
          });
      } catch (dbError) {
        console.error('Failed to store error in database:', dbError);
        // Don't fail the request if database logging fails
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in error logging endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
} 