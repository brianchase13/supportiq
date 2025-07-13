import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { authLimiter, checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const AuthRequestSchema = z.object({
  returnUrl: z.string().url().optional(),
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
    const userId = user.id;

    const { searchParams } = new URL(request.url);
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
    const validationResult = AuthRequestSchema.safeParse({ returnUrl });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
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
    
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

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
    const authUrl = `https://app.intercom.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read_conversations,read_users&state=${encodeURIComponent(state)}`;
    
    return NextResponse.json({ authUrl });

  } catch (error) {
    console.error('Intercom OAuth error:', error);
    return NextResponse.json(
      { error: 'OAuth initialization failed' },
      { status: 500 }
    );
  }
}