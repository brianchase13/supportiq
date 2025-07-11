import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    // In demo mode, return mock test data
    if (access_token.startsWith('demo_access_token_')) {
      return NextResponse.json({
        workspace_name: 'Demo Company',
        admin_count: 3,
        conversation_count: 1247,
        status: 'connected'
      });
    }

    // Try to test with real Intercom API
    const [meResponse, adminsResponse] = await Promise.all([
      fetch('https://api.intercom.io/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
          'Intercom-Version': '2.10'
        }
      }),
      fetch('https://api.intercom.io/admins', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
          'Intercom-Version': '2.10'
        }
      })
    ]);

    if (!meResponse.ok) {
      const error = await meResponse.text();
      return NextResponse.json({ 
        error: `Authentication failed: ${meResponse.status} - ${error}` 
      }, { status: meResponse.status });
    }

    if (!adminsResponse.ok) {
      const error = await adminsResponse.text();
      return NextResponse.json({ 
        error: `Failed to fetch admins: ${adminsResponse.status} - ${error}` 
      }, { status: adminsResponse.status });
    }

    const meData = await meResponse.json();
    const adminsData = await adminsResponse.json();
    
    return NextResponse.json({
      workspace_name: meData.name || 'Your Workspace',
      admin_count: adminsData.admins?.length || 0,
      status: 'connected'
    });

  } catch (error) {
    console.error('Intercom test error:', error);
    return NextResponse.json({ 
      error: 'Network error - please check your connection' 
    }, { status: 500 });
  }
}