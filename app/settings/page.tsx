'use client';

import { Card, Title, Grid, Text, Flex, Badge } from '@tremor/react';
import { Settings, Users, CreditCard, Key, Check, ExternalLink, Plus, Trash2, RefreshCw, Brain, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, syncIntercomData, analyzeTickets, generateInsights } from '@/hooks/data/useSupabaseData';

// For demo purposes, using a hardcoded user ID
// In production, this would come from your auth system
const DEMO_USER_ID = 'demo-user-123';

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser(DEMO_USER_ID);
  const [apiKey, setApiKey] = useState('sk-...a1b2c3d4e5f6');
  const [showApiKey, setShowApiKey] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'analyzing' | 'generating'>('idle');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState({ tickets: 0, insights: 0 });

  const isIntercomConnected = !!user?.intercom_access_token;

  const handleConnectIntercom = () => {
    // Redirect to Intercom OAuth
    window.location.href = `/api/auth/intercom?userId=${DEMO_USER_ID}`;
  };

  const handleDisconnectIntercom = async () => {
    // TODO: Implement disconnect functionality
    alert('Disconnect functionality coming soon!');
  };

  const handleSyncData = async () => {
    if (!isIntercomConnected) {
      alert('Please connect Intercom first');
      return;
    }

    try {
      setSyncStatus('syncing');
      
      // Step 1: Sync tickets from Intercom
      console.log('Syncing tickets from Intercom...');
      const syncResult = await syncIntercomData(DEMO_USER_ID);
      setSyncStats(prev => ({ ...prev, tickets: syncResult.processed || 0 }));

      // Step 2: Analyze tickets with GPT-4
      setSyncStatus('analyzing');
      console.log('Analyzing tickets with AI...');
      const analysisResult = await analyzeTickets(DEMO_USER_ID);

      // Step 3: Generate insights
      setSyncStatus('generating');
      console.log('Generating insights...');
      const insightsResult = await generateInsights(DEMO_USER_ID);
      setSyncStats(prev => ({ ...prev, insights: insightsResult.generatedCount || 0 }));

      setLastSync(new Date().toLocaleString());
      setSyncStatus('idle');
      
      alert(`Sync completed! Processed ${syncResult.processed} tickets and generated ${insightsResult.generatedCount} insights.`);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('idle');
      alert(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const integrations = [
    {
      name: 'Intercom',
      status: isIntercomConnected ? 'connected' : 'disconnected',
      description: 'Customer messaging platform',
      logo: '💬',
      connectedAt: user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : null,
      onConnect: handleConnectIntercom,
      onDisconnect: handleDisconnectIntercom,
    },
    {
      name: 'Zendesk',
      status: 'disconnected',
      description: 'Customer service software',
      logo: '🎫',
      connectedAt: null,
      onConnect: () => alert('Zendesk integration coming soon!'),
      onDisconnect: () => {},
    },
    {
      name: 'Slack',
      status: 'disconnected',
      description: 'Team communication',
      logo: '💬',
      connectedAt: null,
      onConnect: () => alert('Slack integration coming soon!'),
      onDisconnect: () => {},
    },
    {
      name: 'Freshdesk',
      status: 'disconnected',
      description: 'Customer support software',
      logo: '📧',
      connectedAt: null,
      onConnect: () => alert('Freshdesk integration coming soon!'),
      onDisconnect: () => {},
    }
  ];

  const billing = {
    plan: user?.subscription_plan || 'trial',
    status: user?.subscription_status || 'trial',
    price: user?.subscription_plan === 'pro' ? '$299/month' : user?.subscription_plan === 'enterprise' ? '$899/month' : '$99/month',
    renewsOn: '2024-02-15',
    usage: {
      tickets: syncStats.tickets,
      limit: user?.subscription_plan === 'pro' ? 10000 : user?.subscription_plan === 'enterprise' ? 999999 : 1000,
      percentage: Math.min((syncStats.tickets / (user?.subscription_plan === 'pro' ? 10000 : 1000)) * 100, 100)
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing': return 'Syncing tickets from Intercom...';
      case 'analyzing': return 'Analyzing tickets with AI...';
      case 'generating': return 'Generating insights...';
      default: return 'Sync Data';
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'analyzing': return <Brain className="w-4 h-4 animate-pulse" />;
      case 'generating': return <Zap className="w-4 h-4 animate-pulse" />;
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  if (userLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your account, integrations, and billing</p>
      </div>

      {/* Sync Status Card */}
      {isIntercomConnected && (
        <Card className="bg-slate-900 border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <Title className="text-white">Data Synchronization</Title>
            <button
              onClick={handleSyncData}
              disabled={syncStatus !== 'idle'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                syncStatus !== 'idle'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {getSyncStatusIcon()}
              {getSyncStatusText()}
            </button>
          </div>
          
          {lastSync && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{syncStats.tickets}</p>
                <p className="text-sm text-slate-400">Tickets Synced</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{syncStats.insights}</p>
                <p className="text-sm text-slate-400">Insights Generated</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Last Sync</p>
                <p className="text-sm text-slate-400">{lastSync}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Integrations */}
      <Card className="bg-slate-900 border-slate-800">
        <Title className="text-white mb-4">Integrations</Title>
        <Grid numItemsMd={2} numItemsLg={2} className="gap-4">
          {integrations.map((integration) => (
            <div key={integration.name} className="bg-slate-800 rounded-lg p-4">
              <Flex alignItems="start" className="gap-3">
                <div className="text-2xl">{integration.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Text className="font-medium text-white">{integration.name}</Text>
                    <Badge className={integration.status === 'connected' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }>
                      {integration.status === 'connected' ? (
                        <><Check className="w-3 h-3 mr-1" /> Connected</>
                      ) : (
                        'Disconnected'
                      )}
                    </Badge>
                  </div>
                  <Text className="text-sm text-slate-400 mb-3">{integration.description}</Text>
                  {integration.connectedAt && (
                    <Text className="text-xs text-slate-500">
                      Connected on {integration.connectedAt}
                    </Text>
                  )}
                </div>
              </Flex>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={integration.status === 'connected' ? integration.onDisconnect : integration.onConnect}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    integration.status === 'connected'
                      ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
                <button className="px-3 py-1 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </Grid>
      </Card>

      {/* Account Info */}
      <Card className="bg-slate-900 border-slate-800">
        <Title className="text-white mb-4">Account Information</Title>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Email</p>
              <p className="text-sm text-slate-400">{user?.email || 'demo@supportiq.com'}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-white">User ID</p>
              <p className="text-sm text-slate-400">{DEMO_USER_ID}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Billing */}
      <Card className="bg-slate-900 border-slate-800">
        <Title className="text-white mb-4">Billing Information</Title>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Current Plan</p>
              <p className="text-sm text-slate-400">{billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)} Plan - {billing.price}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-white">{billing.status.charAt(0).toUpperCase() + billing.status.slice(1)}</p>
              <p className="text-sm text-slate-400">Renews {new Date(billing.renewsOn).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="p-4 bg-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-white">Usage This Month</p>
              <p className="text-sm text-slate-400">
                {billing.usage.tickets.toLocaleString()} / {billing.usage.limit.toLocaleString()} tickets
              </p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(billing.usage.percentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium">
              Upgrade Plan
            </button>
            <button className="px-4 py-2 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded-lg text-sm transition-colors">
              View Billing History
            </button>
          </div>
        </div>
      </Card>

      {/* API Keys */}
      <Card className="bg-slate-900 border-slate-800">
        <Title className="text-white mb-4">API Keys</Title>
        <div className="space-y-4">
          <div className="p-4 bg-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-white">Production API Key</p>
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <code className="flex-1 p-2 bg-slate-900 rounded text-sm text-slate-300 font-mono">
                {showApiKey ? apiKey : '•'.repeat(20)}
              </code>
              <button className="px-3 py-2 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded transition-colors text-sm">
                Copy
              </button>
            </div>
            <p className="text-xs text-slate-500">Created on Jan 15, 2024 • Last used 2 hours ago</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded-lg transition-colors text-sm">
            <Key className="w-4 h-4" />
            Generate New Key
          </button>
        </div>
      </Card>
    </div>
  );
}