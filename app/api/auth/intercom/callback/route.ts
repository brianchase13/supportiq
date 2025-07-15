import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/client';
import IntercomClient from '@/lib/intercom/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Intercom OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=intercom_oauth_failed&message=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=intercom_no_code`
      );
    }

    // Get user from session
    const cookieStore = request.cookies;
    const user = await auth.getUser(cookieStore);
    
    if (!user?.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=unauthorized`
      );
    }

    // Exchange code for access token
    const intercomClient = new IntercomClient();
    const tokenResponse = await intercomClient.exchangeCodeForToken(code);

    if (!tokenResponse.access_token) {
      console.error('No access token in response:', tokenResponse);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=intercom_token_failed`
      );
    }

    // Store the access token and workspace info
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        intercom_access_token: tokenResponse.access_token,
        intercom_workspace_id: tokenResponse.workspace_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user with Intercom token:', updateError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=intercom_save_failed`
      );
    }

    // Log successful connection
    console.log(`User ${user.id} successfully connected Intercom workspace ${tokenResponse.workspace_id}`);

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=intercom_connected&workspace=${encodeURIComponent(tokenResponse.workspace_id || 'unknown')}`
    );

  } catch (error) {
    console.error('Intercom OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=intercom_callback_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
    );
  }
}