import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear Intercom configuration
    const { error: updateError } = await supabase
      .from('users')
      .update({
        intercom_access_token: null,
        intercom_workspace_id: null,
        intercom_webhook_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error clearing Intercom config:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect Intercom' },
        { status: 500 }
      );
    }

    // Log the disconnection
    await supabase
      .from('integration_logs')
      .insert({
        user_id: user.id,
        provider: 'intercom',
        action: 'disconnect',
        status: 'success',
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Successfully disconnected from Intercom'
    });

  } catch (error) {
    console.error('Error disconnecting from Intercom:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect from Intercom' },
      { status: 500 }
    );
  }
} 