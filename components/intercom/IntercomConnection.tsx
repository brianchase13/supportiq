'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface IntercomConnectionProps {
  user: any;
}

export default function IntercomConnection({ user }: IntercomConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceInfo, setWorkspaceInfo] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    checkConnectionStatus();
  }, [user]);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('intercom_access_token, intercom_workspace_id, intercom_connected_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const hasToken = !!userData?.intercom_access_token;
      setIsConnected(hasToken);
      
      if (hasToken) {
        setWorkspaceInfo({
          workspace_id: userData.intercom_workspace_id,
          connected_at: userData.intercom_connected_at
        });
      }
      
    } catch (error) {
      console.error('Error checking Intercom connection:', error);
      setConnectionError('Failed to check connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_INTERCOM_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/intercom/callback`;
    const state = btoa(JSON.stringify({ userId: user.id, returnUrl: '/dashboard' }));
    
    const oauthUrl = `https://api.intercom.io/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    
    window.location.href = oauthUrl;
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          intercom_access_token: null,
          intercom_workspace_id: null,
          intercom_connected_at: null
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsConnected(false);
      setWorkspaceInfo(null);
      setConnectionError(null);
      
    } catch (error) {
      console.error('Error disconnecting Intercom:', error);
      setConnectionError('Failed to disconnect');
    }
  };

  const handleRefresh = () => {
    checkConnectionStatus();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Checking Intercom Connection...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/intercom-logo.svg" 
              alt="Intercom" 
              className="h-6 w-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            Intercom Integration
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Not Connected"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Connect your Intercom workspace to enable real-time support analytics and ticket deflection insights.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {connectionError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}

        {isConnected ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Successfully connected to Intercom workspace
                {workspaceInfo?.workspace_id && (
                  <span className="font-mono text-sm"> ({workspaceInfo.workspace_id})</span>
                )}
              </AlertDescription>
            </Alert>

            {workspaceInfo?.connected_at && (
              <div className="text-sm text-muted-foreground">
                Connected since: {new Date(workspaceInfo.connected_at).toLocaleDateString()}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              <Button onClick={handleDisconnect} variant="destructive" size="sm">
                Disconnect
              </Button>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">✅ What's Working:</h4>
              <ul className="text-sm space-y-1">
                <li>• Real-time conversation tracking</li>
                <li>• Ticket analytics and categorization</li>
                <li>• Sentiment analysis</li>
                <li>• Deflection scoring</li>
                <li>• Webhook event processing</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Connect your Intercom workspace to start analyzing support conversations and tickets.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">🔧 Setup Steps:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Create Intercom developer app</li>
                  <li>Configure OAuth redirect URL</li>
                  <li>Set up webhook endpoints</li>
                  <li>Grant required permissions</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">📊 Features Enabled:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Conversation analytics</li>
                  <li>• Ticket deflection scoring</li>
                  <li>• Real-time webhooks</li>
                  <li>• Sentiment tracking</li>
                  <li>• Category classification</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleConnect} className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Intercom
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://developers.intercom.com/docs', '_blank')}
              >
                View Docs
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Need help? Check out our{' '}
              <a 
                href="#" 
                className="underline hover:text-foreground"
                onClick={() => window.open('https://developers.intercom.com/docs', '_blank')}
              >
                Intercom integration guide
              </a>
              {' '}or run the setup script: <code className="bg-muted px-1 rounded">node setup-intercom-expert.js</code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 