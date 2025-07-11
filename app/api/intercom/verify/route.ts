import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    // In demo mode, return mock workspace data
    if (access_token.startsWith('demo_access_token_')) {
      return NextResponse.json({
        workspace: {
          name: 'Demo Company',
          id: 'demo_workspace',
          app_id: 'demo123'
        }
      });
    }

    // Try to verify with real Intercom API
    const response = await fetch('https://api.intercom.io/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
        'Intercom-Version': '2.10'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ 
        error: `Intercom API error: ${response.status} - ${error}` 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      workspace: {
        name: data.name || 'Your Workspace',
        id: data.id,
        app_id: data.app?.id_code
      }
    });

  } catch (error) {
    console.error('Intercom verification error:', error);
    return NextResponse.json({ 
      error: 'Failed to verify Intercom connection' 
    }, { status: 500 });
  }
}