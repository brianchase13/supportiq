import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Intercom configuration
    const { data: userConfig } = await supabase
      .from('users')
      .select('intercom_access_token')
      .eq('id', user.id)
      .single();

    if (!userConfig?.intercom_access_token) {
      return NextResponse.json(
        { error: 'Intercom not connected' },
        { status: 400 }
      );
    }

    try {
      // Create a test conversation in Intercom
      const testMessage = {
        message_type: 'conversation',
        subject: 'SupportIQ Webhook Test',
        body: 'This is a test message from SupportIQ to verify webhook connectivity. If you receive this message, your webhook is working correctly!',
        from: {
          type: 'user',
          email: 'test@supportiq.com',
          name: 'SupportIQ Test'
        }
      };

      const response = await fetch('https://api.intercom.io/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userConfig.intercom_access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testMessage)
      });

      if (!response.ok) {
        throw new Error(`Intercom API error: ${response.statusText}`);
      }

      const conversationData = await response.json();

      // Log the test
      await supabase
        .from('webhook_logs')
        .insert({
          user_id: user.id,
          provider: 'intercom',
          event_type: 'test_webhook',
          event_data: {
            conversation_id: conversationData.id,
            test_message: testMessage
          },
          processed_at: new Date().toISOString(),
          status: 'success'
        });

      return NextResponse.json({
        success: true,
        conversation_id: conversationData.id,
        message: 'Test message sent successfully'
      });

    } catch (error) {
      console.error('Error testing webhook:', error);

      // Log the test failure
      await supabase
        .from('webhook_logs')
        .insert({
          user_id: user.id,
          provider: 'intercom',
          event_type: 'test_webhook',
          event_data: { error: error instanceof Error ? error.message : 'Unknown error' },
          processed_at: new Date().toISOString(),
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });

      return NextResponse.json(
        { error: 'Webhook test failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in test webhook endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
} 