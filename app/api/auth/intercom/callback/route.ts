import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { encrypt } from '@/lib/crypto/encryption';
import { authLimiter, checkRateLimit } from '@/lib/rate-limit';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Rate limiting
    const rateLimitResult = await authLimiter.checkLimit(clientIP, 'oauth_callback');
    if (!rateLimitResult.success) {
      return NextResponse.redirect('/settings?error=rate_limited');
    }

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`/settings?error=oauth_${error}`);
    }

    if (!code || !state) {
      return NextResponse.redirect('/settings?error=missing_oauth_params');
    }

    try {
      // Validate state parameter
      const { data: storedState, error: stateError } = await supabaseAdmin
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (stateError || !storedState) {
        console.error('Invalid or expired state:', stateError);
        return NextResponse.redirect('/settings?error=invalid_state');
      }

      // Clean up used state
      await supabaseAdmin
        .from('oauth_states')
        .delete()
        .eq('state', state);

      const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
      const { userId, returnUrl } = stateData;

      // Exchange code for access token with retry logic
      let tokenData: TokenResponse | null = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const tokenResponse = await fetch('https://api.intercom.io/auth/eagle/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'SupportIQ/1.0',
            },
            body: JSON.stringify({
              client_id: process.env.INTERCOM_CLIENT_ID,
              client_secret: process.env.INTERCOM_CLIENT_SECRET,
              code,
            }),
          });

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Token exchange failed (${tokenResponse.status}): ${errorText}`);
          }

          tokenData = await tokenResponse.json();
          break; // Success, exit retry loop

        } catch (error) {
          console.error(`Token exchange attempt ${attempt + 1} failed:`, error);
          
          if (attempt === maxRetries - 1) {
            throw error; // Last attempt, rethrow
          }
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      if (!tokenData?.access_token) {
        throw new Error('Failed to obtain access token');
      }

      // Get workspace info with the new token
      const workspaceResponse = await fetch('https://api.intercom.io/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
          'User-Agent': 'SupportIQ/1.0',
        },
      });

      if (!workspaceResponse.ok) {
        throw new Error(`Failed to get workspace info: ${workspaceResponse.statusText}`);
      }

      const workspaceData = await workspaceResponse.json();

      // Encrypt sensitive data before storage
      const encryptedToken = encrypt(tokenData.access_token);
      const encryptedRefreshToken = tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null;

      // Store encrypted tokens and workspace info
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          intercom_access_token: encryptedToken,
          intercom_refresh_token: encryptedRefreshToken,
          intercom_workspace_id: workspaceData.id,
          intercom_workspace_name: workspaceData.name,
          intercom_connected_at: new Date().toISOString(),
          intercom_token_expires_at: tokenData.expires_in 
            ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user with tokens:', updateError);
        return NextResponse.redirect('/settings?error=database_error');
      }

      // Log successful connection
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'intercom_connected',
          details: {
            workspace_id: workspaceData.id,
            workspace_name: workspaceData.name,
            scopes: tokenData.scope?.split(' ') || [],
          },
        });

      // Redirect to success page or dashboard
      const redirectUrl = returnUrl?.startsWith('/') ? returnUrl : '/dashboard';
      return NextResponse.redirect(`${redirectUrl}?success=intercom_connected`);

    } catch (error) {
      console.error('Token exchange error:', error);
      
      // Log failed attempt
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          user_id: 'unknown',
          action: 'intercom_connection_failed',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
            ip: clientIP,
          },
        });

      return NextResponse.redirect('/settings?error=token_exchange_failed');
    }

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('/settings?error=oauth_callback_failed');
  }
}