'use client';

import { Card } from '@/components/ui/card';
import { Settings, Users, CreditCard, Key, Check, ExternalLink, Plus, Trash2, RefreshCw, Brain, Zap, Shield, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, syncIntercomData, analyzeTickets, generateInsights } from '@/hooks/data/useSupabaseData';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

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
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account, integrations, and billing preferences</p>
        </div>

        {/* Sync Status Card */}
        {isIntercomConnected && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Data Synchronization</h3>
                    <p className="text-sm text-slate-600">Keep your AI insights up to date</p>
                  </div>
                </div>
                <button
                  onClick={handleSyncData}
                  disabled={syncStatus !== 'idle'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    syncStatus !== 'idle'
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  {getSyncStatusIcon()}
                  {getSyncStatusText()}
                </button>
              </div>
              
              {lastSync && (
                <div className="grid grid-cols-3 gap-6 p-4 bg-white rounded-lg border border-blue-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{syncStats.tickets}</p>
                    <p className="text-sm text-slate-600">Tickets Synced</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{syncStats.insights}</p>
                    <p className="text-sm text-slate-600">Insights Generated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900">Last Sync</p>
                    <p className="text-sm text-slate-600">{lastSync}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Integrations */}
        <Card className="border-0 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
                <p className="text-sm text-slate-600">Connect your support tools and platforms</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <div key={integration.name} className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-2xl">{integration.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">{integration.name}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          integration.status === 'connected' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {integration.status === 'connected' ? (
                            <div className="flex items-center gap-1">
                              <Check className="w-3 h-3" /> Connected
                            </div>
                          ) : (
                            'Disconnected'
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{integration.description}</p>
                      {integration.connectedAt && (
                        <p className="text-xs text-slate-500">
                          Connected on {integration.connectedAt}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={integration.status === 'connected' ? integration.onDisconnect : integration.onConnect}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        integration.status === 'connected'
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </button>
                    <button className="px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Account & Billing Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Info */}
          <Card className="border-0 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
                  <p className="text-sm text-slate-600">Your profile and account details</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Email Address</p>
                    <p className="text-sm text-slate-600">{user?.email || 'demo@supportiq.com'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">Account ID</p>
                    <p className="text-sm text-slate-600 font-mono">{DEMO_USER_ID}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Account verified and secure</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Billing */}
          <Card className="border-0 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Billing & Usage</h3>
                  <p className="text-sm text-slate-600">Plan details and consumption</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Current Plan</p>
                    <p className="text-sm text-slate-600">{billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)} Plan - {billing.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{billing.status.charAt(0).toUpperCase() + billing.status.slice(1)}</p>
                    <p className="text-sm text-slate-600">Renews {new Date(billing.renewsOn).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-slate-900">Usage This Month</p>
                    <p className="text-sm text-slate-600">
                      {billing.usage.tickets.toLocaleString()} / {billing.usage.limit.toLocaleString()} tickets
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(billing.usage.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                    Upgrade Plan
                  </button>
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm transition-colors">
                    Billing History
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* API Keys */}
        <Card className="border-0 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">API Keys</h3>
                <p className="text-sm text-slate-600">Manage your API access tokens</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium text-slate-900">Production API Key</p>
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 p-3 bg-white border border-slate-200 rounded text-sm text-slate-700 font-mono">
                    {showApiKey ? apiKey : '•'.repeat(20)}
                  </code>
                  <button className="px-3 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors text-sm font-medium">
                    Copy
                  </button>
                </div>
                <p className="text-xs text-slate-500">Created on Jan 15, 2024 • Last used 2 hours ago</p>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" />
                Generate New Key
              </button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}