import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createIntercomIntegration } from '@/lib/integrations/intercom';

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // Validate the access token by making a test API call
    try {
      const intercom = createIntercomIntegration(access_token);
      
      // Test the connection by fetching workspace info
      const response = await fetch('https://api.intercom.io/admins', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Intercom API error: ${response.statusText}`);
      }

      const data = await response.json();
      const workspaceId = data.admins?.[0]?.app?.id_code || 'unknown';

      // Update user's Intercom configuration
      const { error: updateError } = await supabase
        .from('users')
        .update({
          intercom_access_token: access_token,
          intercom_workspace_id: workspaceId,
          intercom_webhook_url: `${process.env.NEXTAUTH_URL}/api/webhooks/intercom`,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user config:', updateError);
        return NextResponse.json(
          { error: 'Failed to save configuration' },
          { status: 500 }
        );
      }

      // Log the connection
      await supabase
        .from('integration_logs')
        .insert({
          user_id: user.id,
          provider: 'intercom',
          action: 'connect',
          status: 'success',
          metadata: {
            workspace_id: workspaceId,
            admin_count: data.admins?.length || 0
          },
          created_at: new Date().toISOString()
        });

      return NextResponse.json({
        success: true,
        workspace_id: workspaceId,
        message: 'Successfully connected to Intercom'
      });

    } catch (error) {
      console.error('Error validating Intercom token:', error);
      return NextResponse.json(
        { error: 'Invalid access token or connection failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error connecting to Intercom:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Intercom' },
      { status: 500 }
    );
  }
} 