import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { logger } from '@/lib/logging/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Intercom configuration
    const { data: userConfig } = await supabase
      .from('users')
      .select('intercom_access_token, intercom_workspace_id, intercom_webhook_url')
      .eq('id', user.id)
      .single();

    // Get conversation count
    const { count: conversationCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('intercom_id', 'is', null);

    // Get last sync time
    const { data: lastSync } = await supabase
      .from('webhook_logs')
      .select('processed_at')
      .eq('user_id', user.id)
      .eq('provider', 'intercom')
      .eq('status', 'success')
      .order('processed_at', { ascending: false })
      .limit(1)
      .single();

    const config = {
      connected: !!userConfig?.intercom_access_token,
      access_token: userConfig?.intercom_access_token ? '***' : undefined,
      workspace_id: userConfig?.intercom_workspace_id,
      webhook_url: userConfig?.intercom_webhook_url || `${process.env.NEXTAUTH_URL}/api/webhooks/intercom`,
      last_sync: lastSync?.processed_at,
      sync_status: 'idle' as const,
      conversation_count: conversationCount || 0,
      admin_count: 0 // TODO: Fetch from Intercom API
    };

    return NextResponse.json(config);

  } catch (error) {
    await logger.error('Error fetching Intercom config:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
} 