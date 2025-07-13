'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw,
  Loader2,
  Settings,
  Zap,
  Users,
  Clock
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface IntercomConfig {
  connected: boolean;
  access_token?: string;
  workspace_id?: string;
  webhook_url?: string;
  last_sync?: string;
  sync_status: 'idle' | 'syncing' | 'error';
  conversation_count?: number;
  admin_count?: number;
}

export default function IntercomConnection() {
  const { user } = useAuth();
  const [config, setConfig] = useState<IntercomConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (user) {
      fetchIntercomConfig();
    }
  }, [user]);

  const fetchIntercomConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/intercom/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setAccessToken(data.access_token || '');
      }
    } catch (error) {
      console.error('Failed to fetch Intercom config:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectIntercom = async () => {
    if (!accessToken.trim()) {
      alert('Please enter your Intercom access token');
      return;
    }

    try {
      setConnecting(true);
      const response = await fetch('/api/intercom/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken.trim()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Intercom connection result:', result);
        await fetchIntercomConfig();
      } else {
        const error = await response.json();
        alert(`Connection failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error connecting to Intercom:', error);
      alert('Failed to connect to Intercom');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectIntercom = async () => {
    if (!confirm('Are you sure you want to disconnect Intercom? This will stop all automated responses.')) {
      return;
    }

    try {
      const response = await fetch('/api/intercom/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchIntercomConfig();
      } else {
        alert('Failed to disconnect Intercom');
      }
    } catch (error) {
      console.error('Error disconnecting Intercom:', error);
      alert('Failed to disconnect Intercom');
    }
  };

  const syncConversations = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/intercom/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_sync: true
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Sync result:', result);
        await fetchIntercomConfig();
        alert(`Successfully synced ${result.synced_count} conversations`);
      } else {
        const error = await response.json();
        alert(`Sync failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error syncing conversations:', error);
      alert('Failed to sync conversations');
    } finally {
      setSyncing(false);
    }
  };

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/intercom/test-webhook', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Webhook test successful! Check your Intercom dashboard for the test message.');
      } else {
        const error = await response.json();
        alert(`Webhook test failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      alert('Failed to test webhook');
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <div className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Intercom Integration</h2>
            <p className="text-sm text-slate-400">Connect your Intercom workspace for automated support</p>
          </div>
        </div>

        {!config?.connected ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="access_token" className="text-white">Intercom Access Token</Label>
              <div className="relative mt-2">
                <Input
                  id="access_token"
                  type={showToken ? 'text' : 'password'}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter your Intercom access token"
                  className="bg-slate-800 border-slate-700 text-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Get your access token from{' '}
                <a 
                  href="https://developers.intercom.com/installing-intercom/docs/authentication" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Intercom Developer Hub
                </a>
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">What you'll get:</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Real-time ticket ingestion from Intercom</li>
                <li>• AI-powered automated responses</li>
                <li>• Smart ticket categorization and routing</li>
                <li>• Deflection rate tracking and analytics</li>
              </ul>
            </div>

            <Button
              onClick={connectIntercom}
              disabled={connecting || !accessToken.trim()}
              className="bg-green-600 hover:bg-green-700 w-full"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              {connecting ? 'Connecting...' : 'Connect Intercom'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-white font-medium">Connected to Intercom</p>
                  <p className="text-sm text-green-400">Workspace ID: {config.workspace_id}</p>
                </div>
              </div>
              <Button
                onClick={disconnectIntercom}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Disconnect
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Conversations</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {config.conversation_count?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-400">Last Sync</span>
                </div>
                <p className="text-sm text-white">
                  {config.last_sync ? new Date(config.last_sync).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={syncConversations}
                disabled={syncing}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {syncing ? 'Syncing...' : 'Sync Conversations'}
              </Button>

              <Button
                onClick={testWebhook}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Test Webhook
              </Button>
            </div>

            {/* Webhook Info */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Webhook Configuration</h3>
              <p className="text-sm text-slate-400 mb-3">
                Add this webhook URL to your Intercom app settings:
              </p>
              <div className="bg-slate-900 rounded p-3 font-mono text-sm text-slate-300 break-all">
                {config.webhook_url || `${window.location.origin}/api/webhooks/intercom`}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Events: conversation.user.created, conversation.user.replied, ticket.created
              </p>
            </div>

            {/* Settings */}
            <div className="border-t border-slate-800 pt-4">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 