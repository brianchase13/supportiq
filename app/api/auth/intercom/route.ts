import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { authLimiter, checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const AuthRequestSchema = z.object({
  userId: z.string().uuid(),
  returnUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';
    const clientIP = request.ip || 'unknown';

    // Rate limiting
    const rateLimitResult = await checkRateLimit(authLimiter, clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.msBeforeNext 
        },
        { status: 429 }
      );
    }

    // Validate input
    const validationResult = AuthRequestSchema.safeParse({ userId, returnUrl });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Intercom OAuth configuration
    const clientId = process.env.INTERCOM_CLIENT_ID;
    const redirectUri = process.env.INTERCOM_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error('Missing Intercom configuration');
      return NextResponse.json(
        { error: 'OAuth configuration error' },
        { status: 500 }
      );
    }

    // Create secure state parameter
    const stateData = {
      userId,
      returnUrl,
      timestamp: Date.now(),
      nonce: crypto.randomUUID(),
    };
    
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');

    // Store state temporarily for validation (expires in 10 minutes)
    await supabaseAdmin
      .from('oauth_states')
      .insert({
        state,
        user_id: userId,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })
      .single();

    // Build OAuth URL
    const authUrl = new URL('https://app.intercom.com/oauth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'read_conversations read_users read_admins');

    return NextResponse.redirect(authUrl.toString());

  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}